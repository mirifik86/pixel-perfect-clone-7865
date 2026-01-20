import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OCR and Image Analysis using Gemini Vision
const getOcrPrompt = (language: string) => {
  const isFr = language === 'fr';
  
  return `You are an expert OCR and image analysis system. Analyze this screenshot/image and perform two tasks:

TASK 1: TEXT EXTRACTION (OCR)
- Extract ALL visible text from the image
- Preserve meaningful structure (paragraphs, lists)
- Normalize whitespace (remove excessive spaces)
- Remove obvious OCR garbage (repeated stray symbols like "|||" or "###")
- Preserve line breaks where they indicate semantic separation

TASK 2: IMAGE SIGNAL ANALYSIS
Evaluate these cautious, low-risk signals:

1. screenshot_likelihood: Is this likely a screenshot vs a photo?
   - "likely": Has UI elements, browser chrome, app interface, flat graphics
   - "uncertain": Ambiguous or photo-like

2. blur_level: How blurry is the image?
   - "low": Clear, readable
   - "medium": Some blur but mostly readable
   - "high": Significant blur affecting readability

3. compression_artifacts: JPEG/image compression quality
   - "low": Clean edges, no visible blocky artifacts
   - "medium": Some visible artifacts around text/edges
   - "high": Heavy compression, blocky, degraded quality

4. suspicious_editing_hints: Any signs of image manipulation?
   - "none": No obvious editing indicators
   - "possible": Some potential indicators (inconsistent lighting, edges, clone patterns) - LOW CONFIDENCE ONLY

5. metadata_present: Can you detect any embedded information?
   - "yes": Has visible source info, timestamps, watermarks
   - "no": No visible metadata
   - "partial": Some but incomplete

IMPORTANT CONSTRAINTS:
- Be CAUTIOUS in your assessments
- NEVER make definitive claims about authenticity
- "possible" editing hints = low confidence only
- Metadata presence ≠ proof of authenticity

Calculate an overall OCR confidence score (0.0 to 1.0):
- 0.9-1.0: Crystal clear, professional screenshot
- 0.7-0.89: Good quality, minor issues
- 0.5-0.69: Readable but some problems
- Below 0.5: Poor quality, significant text unclear

RESPONSE FORMAT (JSON only):
{
  "raw_text": "<exact text as seen>",
  "cleaned_text": "<post-processed text>",
  "ocr_confidence": <0.0-1.0>,
  "text_length": <character count>,
  "image_signals": {
    "screenshot_likelihood": "<likely|uncertain>",
    "blur_level": "<low|medium|high>",
    "compression_artifacts": "<low|medium|high>",
    "suspicious_editing_hints": "<none|possible>",
    "metadata_present": "<yes|no|partial>"
  },
  "quality_notes": "<brief explanation of quality assessment>"
}

Respond ONLY with valid JSON, no additional text.`;
};

// Helper to convert base64 to proper format for API
const extractBase64Data = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  // If no data URL format, assume it's raw base64 and PNG
  return { mimeType: 'image/png', data: dataUrl };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, language, analysisType } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting OCR and image signal analysis...");

    // Extract base64 data
    const { mimeType, data } = extractBase64Data(imageData);
    
    // Step 1: OCR + Image Signals using Gemini Vision
    const ocrResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: getOcrPrompt(language || 'en')
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${data}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!ocrResponse.ok) {
      if (ocrResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'fr' ? "Limite de requêtes atteinte. Réessayez dans quelques instants." : "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (ocrResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: language === 'fr' ? "Crédits IA épuisés." : "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await ocrResponse.text();
      console.error("OCR API error:", ocrResponse.status, errorText);
      throw new Error(`OCR failed: ${ocrResponse.status}`);
    }

    const ocrResult = await ocrResponse.json();
    const ocrContent = ocrResult.choices?.[0]?.message?.content;

    if (!ocrContent) {
      throw new Error("No OCR response from AI");
    }

    console.log("OCR response received:", ocrContent.substring(0, 300));

    // Parse OCR result
    let ocrData;
    try {
      const jsonMatch = ocrContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ocrData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON in OCR response");
      }
    } catch (parseError) {
      console.error("Failed to parse OCR response:", parseError);
      // Fallback with conservative defaults
      ocrData = {
        raw_text: "",
        cleaned_text: "",
        ocr_confidence: 0.3,
        text_length: 0,
        image_signals: {
          screenshot_likelihood: "uncertain",
          blur_level: "medium",
          compression_artifacts: "medium",
          suspicious_editing_hints: "none",
          metadata_present: "no"
        },
        quality_notes: "OCR processing encountered issues"
      };
    }

    // Step 2: Now run the LeenScore analysis on the extracted text
    const isPro = analysisType === 'pro';
    
    // If text is too short or OCR confidence too low, return with warning
    const textToAnalyze = ocrData.cleaned_text || ocrData.raw_text || "";
    const confidence = ocrData.ocr_confidence || 0;
    
    if (textToAnalyze.length < 10) {
      return new Response(
        JSON.stringify({
          success: true,
          ocr: {
            raw_text: ocrData.raw_text || "",
            cleaned_text: textToAnalyze,
            confidence: confidence,
            text_length: textToAnalyze.length,
          },
          image_signals: ocrData.image_signals,
          quality_notes: ocrData.quality_notes,
          analysis: null,
          warning: language === 'fr' 
            ? "Texte extrait insuffisant. Veuillez modifier ou coller le texte manuellement." 
            : "Insufficient text extracted. Please edit or paste text manually."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the existing analyze function for LeenScore analysis
    const analyzeResponse = await fetch(`${req.headers.get('origin') || 'https://clejmxumuqhpjncjuuht.supabase.co'}/functions/v1/analyze`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get('authorization') || '',
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: textToAnalyze,
        language: language || 'en',
        analysisType: analysisType || 'standard'
      }),
    });

    let analysisResult = null;
    if (analyzeResponse.ok) {
      analysisResult = await analyzeResponse.json();
      
      // Apply OCR uncertainty penalty if needed
      if (confidence < 0.55 && analysisResult.score) {
        // Small uncertainty penalty (max -5 points)
        const penalty = Math.round((0.55 - confidence) * 10);
        analysisResult.score = Math.max(5, analysisResult.score - penalty);
        analysisResult.ocrPenaltyApplied = penalty;
      }
    } else {
      console.error("LeenScore analysis failed:", await analyzeResponse.text());
    }

    // Return combined result
    return new Response(
      JSON.stringify({
        success: true,
        ocr: {
          raw_text: ocrData.raw_text || "",
          cleaned_text: textToAnalyze,
          confidence: confidence,
          text_length: textToAnalyze.length,
        },
        image_signals: ocrData.image_signals,
        quality_notes: ocrData.quality_notes,
        analysis: analysisResult,
        warning: confidence < 0.55 
          ? (language === 'fr' 
            ? "Confiance OCR faible. Le score peut être moins précis." 
            : "Low OCR confidence. Score may be less accurate.")
          : null
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Image analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Image analysis failed",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
