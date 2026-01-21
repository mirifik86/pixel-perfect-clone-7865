import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Maximum sizes
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB for URL-based images
const MAX_BASE64_SIZE_BYTES = 2 * 1024 * 1024; // 2MB for legacy base64

// OCR and Image Analysis using Gemini Vision with STRICT credibility guardrails
const getOcrPrompt = (language: string) => {
  const isFr = language === "fr";

  const langInstructions = isFr
    ? `IMPORTANT: Your "visual_description" field MUST be written in FRENCH (Français).`
    : `IMPORTANT: Your "visual_description" field MUST be written in ENGLISH.`;

  return `You are an expert OCR and image analysis system with STRICT CREDIBILITY GUARDRAILS. Analyze this screenshot/image.

${langInstructions}

═══════════════════════════════════════════════════════════════════
CRITICAL GUARDRAIL RULES — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════════════

RULE 1: VISUAL IDENTITY VS TEXT MISMATCH DETECTION
- If the image shows a CLEARLY IDENTIFIABLE PUBLIC FIGURE
- AND the text refers to a DIFFERENT person, country, or authority
→ You MUST flag "visual_text_mismatch": true
→ Describe exactly who is visible vs who the text mentions

RULE 2: IMAGE DOES NOT PROVE CLAIMS
- NEVER state the image "confirms", "supports", or "proves" anything
- Images are ONLY "illustrative context"
- Images NEVER constitute evidence of factual announcements

RULE 3: SCREENSHOT = HIGH-RISK INPUT
- All screenshots (especially social media) are HIGH-RISK
- Default assumption: unverified until proven otherwise

RULE 4: NO STORYTELLING
- Do NOT invent political logic
- Do NOT claim hypothetical media coverage
- Do NOT infer institutional processes
- ONLY describe what is VISIBLE and what the text EXPLICITLY claims

RULE 5: FACTUAL SIGNALS ONLY
- Describe ONLY observable facts
- No identity assumptions beyond clearly visible
- No political role assumptions
- No authority confirmation

═══════════════════════════════════════════════════════════════════

TASK 1: TEXT EXTRACTION (OCR)
- Extract ALL visible text from the image
- Preserve meaningful structure (paragraphs, lists)
- Normalize whitespace
- Remove obvious OCR garbage

TASK 2: VISUAL-TEXT MISMATCH CHECK
- Identify any clearly recognizable public figures in the image
- Compare with entities mentioned in the text
- Flag mismatch if the visible person differs from text subject

TASK 3: IMAGE SIGNAL ANALYSIS (RESTRICTED)
Evaluate ONLY these observable signals:

1. screenshot_likelihood: "likely" | "uncertain"
2. blur_level: "low" | "medium" | "high"
3. compression_artifacts: "low" | "medium" | "high"
4. suspicious_editing_hints: "none" | "possible" (low confidence only)
5. metadata_present: "yes" | "no" | "partial"

TASK 4: VISUAL DESCRIPTION (STRICTLY FACTUAL)
${isFr ? "- Write the description IN FRENCH" : "- Write the description IN ENGLISH"}
- Describe ONLY what is visible
- If a public figure is recognizable, state their name
- Do NOT make claims about what the image "proves"
- State explicitly what CANNOT be verified from the image alone

OCR CONFIDENCE (0.0 to 1.0):
- 0.9-1.0: Crystal clear
- 0.7-0.89: Good quality
- 0.5-0.69: Readable with issues
- Below 0.5: Poor quality

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
  "visual_text_mismatch": {
    "detected": <true|false>,
    "visible_entity": "<who/what is clearly visible in image, or null>",
    "text_entity": "<who/what the text refers to, or null>",
    "mismatch_description": "<explanation if mismatch detected, or null>"
  },
  "visual_description": "<strictly factual description ${isFr ? "IN FRENCH" : "IN ENGLISH"}>",
  "quality_notes": "<brief quality assessment>",
  "credibility_flags": {
    "is_social_media_screenshot": <true|false>,
    "contains_unverifiable_claims": <true|false>,
    "image_proves_nothing": true
  }
}

Respond ONLY with valid JSON, no additional text.`;
};

// Helper to extract base64 data from data URL
const extractBase64Data = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/png", data: dataUrl };
};

// Estimate base64 size in bytes
const estimateBase64Size = (base64Data: string): number => {
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

// Fetch image from URL and return as base64
const fetchImageAsBase64 = async (url: string): Promise<{ data: string; mimeType: string; size: number }> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const size = arrayBuffer.byteLength;
  
  // Convert to base64
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  
  return { data: base64, mimeType: contentType, size };
};

// Apply credibility guardrails to analysis result
const applyCredibilityGuardrails = (analysisResult: any, ocrData: any, language: string): any => {
  if (!analysisResult) return analysisResult;

  const isFr = language === "fr";
  let modifiedResult = { ...analysisResult };
  let guardrailsApplied: string[] = [];
  let maxAllowedScore = 98;

  // RULE 1: Visual-Text Mismatch → Score capped at 50
  if (ocrData.visual_text_mismatch?.detected) {
    maxAllowedScore = Math.min(maxAllowedScore, 50);
    guardrailsApplied.push("visual_text_mismatch");

    const mismatchExplanation = isFr
      ? `⚠️ INCOHÉRENCE VISUEL-TEXTE: L'image montre "${ocrData.visual_text_mismatch.visible_entity}". Le texte fait référence à "${ocrData.visual_text_mismatch.text_entity}". Aucun lien vérifié entre l'image et l'affirmation spécifique du texte.`
      : `⚠️ VISUAL-TEXT MISMATCH: The image shows "${ocrData.visual_text_mismatch.visible_entity}". The text refers to "${ocrData.visual_text_mismatch.text_entity}". There is no verified link between the image and the specific claim made in the text.`;

    modifiedResult.explanation = mismatchExplanation + "\n\n" + (modifiedResult.explanation || "");
    modifiedResult.visualTextMismatch = ocrData.visual_text_mismatch;
  }

  // RULE 3: Screenshot with no verified sources → Score in 30-50 range
  if (ocrData.credibility_flags?.is_social_media_screenshot) {
    maxAllowedScore = Math.min(maxAllowedScore, 50);
    guardrailsApplied.push("social_media_screenshot");
  }

  // RULE 3: Unverifiable claims → Score capped
  if (ocrData.credibility_flags?.contains_unverifiable_claims) {
    maxAllowedScore = Math.min(maxAllowedScore, 55);
    guardrailsApplied.push("unverifiable_claims");
  }

  // Check for high-risk keywords
  const textLower = (ocrData.cleaned_text || "").toLowerCase();
  const highRiskKeywords = [
    "war", "guerre", "invasion", "nuclear", "nucléaire", "assassination", "assassinat",
    "coup", "overthrow", "billions", "milliards", "trillion", "billion",
    "president", "président", "prime minister", "premier ministre",
    "emergency", "urgence", "martial law", "loi martiale",
    "breaking", "urgent", "exclusive", "leaked", "fuite",
  ];

  const containsHighRiskClaims = highRiskKeywords.some((keyword) => textLower.includes(keyword));
  if (containsHighRiskClaims) {
    maxAllowedScore = Math.min(maxAllowedScore, 50);
    guardrailsApplied.push("high_risk_claims");
  }

  // Apply score cap
  if (modifiedResult.score && modifiedResult.score > maxAllowedScore) {
    modifiedResult.originalScore = modifiedResult.score;
    modifiedResult.score = maxAllowedScore;
    modifiedResult.scoreCapped = true;
    modifiedResult.scoreCappedReason = guardrailsApplied;
  }

  // Add mandatory credibility context
  const credibilityDisclaimer = isFr
    ? "\n\n📋 Cette analyse est basée sur le texte extrait et un contexte visuel limité. Les captures d'écran peuvent être partielles ou trompeuses et ne constituent pas une preuve de faits."
    : "\n\n📋 This analysis is based on extracted text and limited visual context. Screenshots can be partial or misleading and do not constitute proof of factual claims.";

  modifiedResult.explanation = (modifiedResult.explanation || "") + credibilityDisclaimer;

  modifiedResult.isScreenshotAnalysis = true;
  modifiedResult.guardrailsApplied = guardrailsApplied;
  modifiedResult.visualDescription = ocrData.visual_description;
  modifiedResult.credibilityFlags = ocrData.credibility_flags;

  return modifiedResult;
};

// Create default OCR data when OCR fails
const createDefaultOcrData = (language: string) => {
  const isFr = language === "fr";
  return {
    raw_text: "",
    cleaned_text: "",
    ocr_confidence: 0,
    text_length: 0,
    image_signals: {
      screenshot_likelihood: "uncertain",
      blur_level: "medium",
      compression_artifacts: "medium",
      suspicious_editing_hints: "none",
      metadata_present: "no",
    },
    visual_text_mismatch: {
      detected: false,
      visible_entity: null,
      text_entity: null,
      mismatch_description: null,
    },
    visual_description: isFr 
      ? "L'extraction de texte n'a pas pu être effectuée sur cette image."
      : "Text extraction could not be performed on this image.",
    quality_notes: isFr 
      ? "Analyse OCR non disponible"
      : "OCR analysis unavailable",
    credibility_flags: {
      is_social_media_screenshot: true,
      contains_unverifiable_claims: true,
      image_proves_nothing: true,
    },
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      image_url, 
      imageData, // Legacy base64 support
      language = "en", 
      analysisType = "standard",
      original_filename,
      mime,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let imageBase64: string;
    let imageMimeType: string;
    let imageSize: number;

    // Handle URL-based image (preferred)
    if (image_url) {
      console.log("Fetching image from URL:", image_url.substring(0, 100) + "...");
      
      try {
        const fetchedImage = await fetchImageAsBase64(image_url);
        imageBase64 = fetchedImage.data;
        imageMimeType = fetchedImage.mimeType;
        imageSize = fetchedImage.size;
        
        console.log(`Image fetched: ${(imageSize / (1024 * 1024)).toFixed(2)} MB, type: ${imageMimeType}`);
        
        // Check size limit
        if (imageSize > MAX_IMAGE_SIZE_BYTES) {
          return new Response(
            JSON.stringify({
              success: false,
              error: language === "fr" 
                ? `Image trop volumineuse pour l'OCR (max ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} Mo). Veuillez télécharger une image plus petite.`
                : `Image too large for OCR (max ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB). Please upload a smaller image.`,
              code: "IMAGE_TOO_LARGE",
            }),
            { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (fetchError) {
        console.error("Failed to fetch image from URL:", fetchError);
        return new Response(
          JSON.stringify({
            success: false,
            error: language === "fr"
              ? "Impossible de récupérer l'image depuis l'URL fournie."
              : "Unable to fetch image from the provided URL.",
            code: "FETCH_FAILED",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // Handle legacy base64 (with strict size limit)
    else if (imageData) {
      console.log("Processing legacy base64 image...");
      
      const { mimeType, data } = extractBase64Data(imageData);
      imageBase64 = data;
      imageMimeType = mimeType;
      imageSize = estimateBase64Size(data);
      
      console.log(`Base64 image size: ${(imageSize / (1024 * 1024)).toFixed(2)} MB`);
      
      // Strict size limit for base64
      if (imageSize > MAX_BASE64_SIZE_BYTES) {
        return new Response(
          JSON.stringify({
            success: false,
            error: language === "fr"
              ? `Image base64 trop volumineuse (max ${MAX_BASE64_SIZE_BYTES / (1024 * 1024)} Mo). Utilisez le téléchargement par URL.`
              : `Base64 image too large (max ${MAX_BASE64_SIZE_BYTES / (1024 * 1024)} MB). Please use URL-based upload.`,
            code: "BASE64_TOO_LARGE",
          }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    // No image provided
    else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Image URL or data is required",
          code: "NO_IMAGE",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting OCR with Gemini Vision...");

    // OCR using Gemini Vision
    let ocrData: any;
    let ocrSuccess = true;
    let ocrError: string | null = null;
    const warnings: string[] = [];

    try {
      const ocrPrompt = getOcrPrompt(language);
      
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
                { type: "text", text: ocrPrompt },
                {
                  type: "image_url",
                  image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      console.log("Gemini Vision response status:", ocrResponse.status);

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        console.error("Gemini Vision API error:", ocrResponse.status, errorText);
        
        // Handle rate limit gracefully
        if (ocrResponse.status === 429) {
          ocrSuccess = false;
          ocrError = language === "fr" 
            ? "Limite de requêtes atteinte. Réessayez dans quelques instants."
            : "Rate limit exceeded. Please try again later.";
          warnings.push(ocrError);
          ocrData = createDefaultOcrData(language);
        } else if (ocrResponse.status === 402) {
          ocrSuccess = false;
          ocrError = language === "fr" ? "Crédits IA épuisés." : "AI credits exhausted.";
          warnings.push(ocrError);
          ocrData = createDefaultOcrData(language);
        } else {
          throw new Error(`OCR API error: ${ocrResponse.status}`);
        }
      } else {
        const ocrResult = await ocrResponse.json();
        const ocrContent = ocrResult.choices?.[0]?.message?.content;

        if (!ocrContent) {
          throw new Error("No OCR response from AI");
        }

        console.log("OCR response received:", ocrContent.substring(0, 300));

        // Parse OCR result
        try {
          const jsonMatch = ocrContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            ocrData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON in OCR response");
          }
        } catch (parseError) {
          console.error("Failed to parse OCR response:", parseError);
          ocrSuccess = false;
          ocrError = language === "fr"
            ? "Erreur de parsing OCR"
            : "OCR parsing error";
          warnings.push(language === "fr"
            ? "Extraction de texte partiellement disponible."
            : "Text extraction partially available.");
          ocrData = createDefaultOcrData(language);
        }
      }
    } catch (ocrException) {
      console.error("OCR exception:", ocrException);
      ocrSuccess = false;
      ocrError = ocrException instanceof Error ? ocrException.message : "OCR failed";
      warnings.push(language === "fr"
        ? "Extraction de texte non disponible; analyse visuelle complétée."
        : "Text extraction unavailable; visual analysis completed.");
      ocrData = createDefaultOcrData(language);
    }

    // Ensure credibility_flags exists
    if (!ocrData.credibility_flags) {
      ocrData.credibility_flags = {
        is_social_media_screenshot: true,
        contains_unverifiable_claims: true,
        image_proves_nothing: true,
      };
    }
    ocrData.credibility_flags.image_proves_nothing = true;

    const textToAnalyze = ocrData.cleaned_text || ocrData.raw_text || "";
    const confidence = ocrData.ocr_confidence || 0;

    // If insufficient text, return early with visual analysis only
    if (textToAnalyze.length < 10) {
      return new Response(
        JSON.stringify({
          success: true,
          ocr_success: ocrSuccess,
          ocr_error: ocrError,
          ocr: {
            raw_text: ocrData.raw_text || "",
            cleaned_text: textToAnalyze,
            confidence: confidence,
            text_length: textToAnalyze.length,
          },
          image_signals: ocrData.image_signals,
          visual_text_mismatch: ocrData.visual_text_mismatch,
          visual_description: ocrData.visual_description,
          credibility_flags: ocrData.credibility_flags,
          quality_notes: ocrData.quality_notes,
          analysis: null,
          warnings: warnings.length > 0 ? warnings : [
            language === "fr"
              ? "Texte extrait insuffisant. Veuillez modifier ou coller le texte manuellement."
              : "Insufficient text extracted. Please edit or paste text manually."
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the analyze function for text analysis
    let analysisResult = null;
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://clejmxumuqhpjncjuuht.supabase.co";
      const analyzeResponse = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
        method: "POST",
        headers: {
          Authorization: req.headers.get("authorization") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textToAnalyze,
          language: language,
          analysisType: analysisType,
          isScreenshot: true,
        }),
      });

      if (analyzeResponse.ok) {
        analysisResult = await analyzeResponse.json();
        analysisResult = applyCredibilityGuardrails(analysisResult, ocrData, language);

        // Apply OCR uncertainty penalty
        if (confidence < 0.55 && analysisResult.score) {
          const penalty = Math.round((0.55 - confidence) * 15);
          analysisResult.score = Math.max(5, analysisResult.score - penalty);
          analysisResult.ocrPenaltyApplied = penalty;
        }

        // Ensure score never exceeds screenshot limits
        if (analysisResult.score > 70 && !analysisResult.proSources?.length) {
          analysisResult.score = 50;
          analysisResult.scoreCapped = true;
          analysisResult.scoreCappedReason = (analysisResult.scoreCappedReason || []).concat([
            "no_external_verification",
          ]);
        }
      } else {
        const errorText = await analyzeResponse.text();
        console.error("Analysis function failed:", errorText);
        warnings.push(language === "fr"
          ? "Analyse textuelle partielle."
          : "Partial text analysis.");
      }
    } catch (analyzeError) {
      console.error("Analysis error:", analyzeError);
      warnings.push(language === "fr"
        ? "Analyse textuelle non disponible."
        : "Text analysis unavailable.");
    }

    // Always return success with available data
    return new Response(
      JSON.stringify({
        success: true,
        ocr_success: ocrSuccess,
        ocr_error: ocrError,
        ocr: {
          raw_text: ocrData.raw_text || "",
          cleaned_text: textToAnalyze,
          confidence: confidence,
          text_length: textToAnalyze.length,
        },
        image_signals: ocrData.image_signals,
        visual_text_mismatch: ocrData.visual_text_mismatch,
        visual_description: ocrData.visual_description,
        credibility_flags: ocrData.credibility_flags,
        quality_notes: ocrData.quality_notes,
        analysis: analysisResult,
        warnings: warnings.length > 0 ? warnings : (
          confidence < 0.55
            ? [language === "fr"
                ? "Confiance OCR faible. Le score reflète cette incertitude."
                : "Low OCR confidence. Score reflects this uncertainty."]
            : []
        ),
        mandatory_disclaimer: language === "fr"
          ? "Cette analyse est basée sur le texte extrait et un contexte visuel limité. Les captures d'écran peuvent être partielles ou trompeuses et ne constituent pas une preuve de faits."
          : "This analysis is based on extracted text and limited visual context. Screenshots can be partial or misleading and do not constitute proof of factual claims.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // NEVER throw uncaught - always return JSON
    console.error("Image analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Image analysis failed";
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
