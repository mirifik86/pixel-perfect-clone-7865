import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Multi-Layer Visual Credibility Analysis Engine
// Implements LeenScore's 5-Layer Assessment Methodology
const getMultiLayerAnalysisPrompt = (language: string) => {
  const isFr = language === 'fr';
  
  const langInstructions = isFr 
    ? `IMPORTANT: Toutes les descriptions et explications DOIVENT être rédigées en FRANÇAIS.`
    : `IMPORTANT: All descriptions and explanations MUST be written in ENGLISH.`;
  
  return `You are LeenScore's Visual Credibility Analysis Engine.
Perform a comprehensive MULTI-LAYER image credibility assessment.

${langInstructions}

═══════════════════════════════════════════════════════════════════
LAYER 1: OCR ANALYSIS — Text Extraction & Linguistic Signals
═══════════════════════════════════════════════════════════════════
Extract ALL visible text with high precision.
Analyze:
- Text clarity and readability
- Language tone (neutral, sensational, emotional, clickbait)
- Sensational wording markers (BREAKING, EXCLUSIVE, URGENT, etc.)
- Internal consistency (contradictions, logical gaps)
- Certitude level (absolute claims vs hedged statements)

═══════════════════════════════════════════════════════════════════
LAYER 2: VISUAL INTEGRITY CHECK — Manipulation Detection
═══════════════════════════════════════════════════════════════════
Assess visual authenticity:
- Lighting consistency (shadows, reflections, highlights)
- Perspective and proportions coherence
- Edge artifacts and splicing indicators
- Compression patterns (JPEG artifacts, re-encoding signs)
- Color space anomalies
- Signs of AI generation (texture repetition, unnatural details)
- Metadata presence indicators

═══════════════════════════════════════════════════════════════════
LAYER 3: CONTEXTUAL INTERPRETATION — Claim Analysis
═══════════════════════════════════════════════════════════════════
Determine the image's claims:
- What does the image explicitly claim or imply?
- Visual-Text mismatch detection (person shown vs person mentioned)
- Missing context indicators
- Unverifiable elements
- Misleading framing or cropping
- Source attribution analysis

═══════════════════════════════════════════════════════════════════
LAYER 4: PLAUSIBILITY SCORING — Reality Check
═══════════════════════════════════════════════════════════════════
Evaluate real-world alignment:
- Does the claim align with known facts?
- Temporal consistency (dates, events, context)
- Geographic consistency
- Institutional logic (does this match how organizations operate?)
- Pattern recognition (common misinformation templates)

═══════════════════════════════════════════════════════════════════
LAYER 5: CREDIBILITY SYNTHESIS — Final Assessment
═══════════════════════════════════════════════════════════════════
Generate comprehensive credibility output.

CRITICAL RULES (NON-NEGOTIABLE):
- NEVER claim the image "proves", "confirms", or "validates" anything
- Images are ILLUSTRATIVE CONTEXT ONLY
- Screenshots are HIGH-RISK by default
- NO storytelling or invented context
- REMAIN NEUTRAL and analytical
- Focus on VERIFIABILITY, not truth claims

═══════════════════════════════════════════════════════════════════

RESPONSE FORMAT (JSON only):
{
  "layer1_ocr": {
    "raw_text": "<exact visible text>",
    "cleaned_text": "<processed text>",
    "ocr_confidence": <0.0-1.0>,
    "text_length": <character count>,
    "linguistic_signals": {
      "tone": "<neutral|sensational|emotional|clickbait|informative>",
      "sensational_markers": ["<list of trigger words found>"],
      "certitude_level": "<absolute|high|moderate|hedged|uncertain>",
      "internal_consistency": "<consistent|minor_gaps|contradictions>"
    }
  },
  "layer2_visual_integrity": {
    "overall_integrity": "<authentic|uncertain|suspicious>",
    "lighting_coherence": "<consistent|minor_issues|inconsistent>",
    "perspective_check": "<natural|distorted|manipulated>",
    "compression_artifacts": "<none|low|medium|high|severe>",
    "edge_artifacts": "<none|minimal|visible|obvious>",
    "ai_generation_likelihood": "<unlikely|possible|likely>",
    "manipulation_indicators": ["<list of specific issues found>"],
    "integrity_score": <0-100>
  },
  "layer3_context": {
    "explicit_claims": ["<what the image/text explicitly claims>"],
    "implied_claims": ["<what is suggested but not stated>"],
    "visual_text_mismatch": {
      "detected": <true|false>,
      "visible_entity": "<who/what is shown>",
      "text_entity": "<who/what text refers to>",
      "mismatch_severity": "<none|minor|moderate|severe>"
    },
    "missing_context": ["<important context not visible>"],
    "unverifiable_elements": ["<claims that cannot be verified from image>"],
    "source_indicators": {
      "platform_detected": "<twitter|facebook|instagram|news|unknown>",
      "original_source_visible": <true|false>,
      "attribution_quality": "<clear|partial|absent>"
    }
  },
  "layer4_plausibility": {
    "real_world_alignment": "<aligned|uncertain|misaligned>",
    "temporal_consistency": "<consistent|unverifiable|inconsistent>",
    "geographic_consistency": "<consistent|unverifiable|inconsistent>",
    "institutional_logic": "<plausible|questionable|implausible>",
    "misinformation_patterns": ["<known patterns detected>"],
    "plausibility_score": <0-100>
  },
  "layer5_synthesis": {
    "visual_credibility_score": <0-100>,
    "confidence_in_assessment": "<high|medium|low>",
    "risk_level": "<low|moderate|high|critical>",
    "public_explanation": "${isFr ? '<explication neutre et accessible en français, 2-3 phrases>' : '<neutral, accessible explanation in English, 2-3 sentences>'}",
    "pro_explanation": "${isFr ? '<analyse experte détaillée incluant incertitudes, facteurs de risque, éléments non vérifiés, en français>' : '<detailed expert analysis including uncertainties, risk factors, unverified elements, in English>'}",
    "key_uncertainties": ["<main factors limiting certainty>"],
    "verification_recommendations": ["<what would be needed to verify>"]
  },
  "credibility_flags": {
    "is_social_media_screenshot": <true|false>,
    "contains_unverifiable_claims": <true|false>,
    "high_risk_topic": <true|false>,
    "manipulation_suspected": <true|false>,
    "requires_external_verification": <true|false>,
    "image_proves_nothing": true
  },
  "visual_description": "${isFr ? '<description factuelle stricte de ce qui est visible, en français>' : '<strictly factual description of what is visible, in English>'}"
}

Respond ONLY with valid JSON, no additional text.`;
};

// Helper to convert base64 to proper format for API
const extractBase64Data = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/png', data: dataUrl };
};

// Calculate final credibility score from multi-layer analysis
const calculateFinalScore = (analysisData: any): number => {
  const layer2Score = analysisData.layer2_visual_integrity?.integrity_score || 50;
  const layer4Score = analysisData.layer4_plausibility?.plausibility_score || 50;
  const layer5Score = analysisData.layer5_synthesis?.visual_credibility_score || 50;
  
  // Weighted average: Visual integrity (25%), Plausibility (30%), Synthesis (45%)
  let score = Math.round(layer2Score * 0.25 + layer4Score * 0.30 + layer5Score * 0.45);
  
  // Apply penalty caps based on flags
  const flags = analysisData.credibility_flags || {};
  
  if (flags.manipulation_suspected) {
    score = Math.min(score, 35);
  }
  if (analysisData.layer3_context?.visual_text_mismatch?.detected) {
    score = Math.min(score, 50);
  }
  if (flags.is_social_media_screenshot && !flags.original_source_visible) {
    score = Math.min(score, 55);
  }
  if (flags.high_risk_topic) {
    score = Math.min(score, 50);
  }
  if (flags.contains_unverifiable_claims) {
    score = Math.min(score, 60);
  }
  
  // Ensure score is within bounds
  return Math.max(5, Math.min(98, score));
};

// Apply credibility guardrails to analysis result
const applyCredibilityGuardrails = (
  analysisResult: any, 
  imageAnalysis: any, 
  language: string
): any => {
  if (!analysisResult) return analysisResult;
  
  const isFr = language === 'fr';
  let modifiedResult = { ...analysisResult };
  let guardrailsApplied: string[] = [];
  let maxAllowedScore = 98;
  
  // RULE 1: Visual-Text Mismatch → Score capped at 50
  if (imageAnalysis.layer3_context?.visual_text_mismatch?.detected) {
    maxAllowedScore = Math.min(maxAllowedScore, 50);
    guardrailsApplied.push('visual_text_mismatch');
    
    const mismatch = imageAnalysis.layer3_context.visual_text_mismatch;
    const mismatchExplanation = isFr
      ? `⚠️ INCOHÉRENCE VISUEL-TEXTE: L'image montre "${mismatch.visible_entity}". Le texte fait référence à "${mismatch.text_entity}". Cette discordance affecte significativement la crédibilité.`
      : `⚠️ VISUAL-TEXT MISMATCH: The image shows "${mismatch.visible_entity}". The text refers to "${mismatch.text_entity}". This discrepancy significantly impacts credibility.`;
    
    modifiedResult.explanation = mismatchExplanation + "\n\n" + (modifiedResult.explanation || '');
  }
  
  // RULE 2: Manipulation suspected → Score capped at 35
  if (imageAnalysis.credibility_flags?.manipulation_suspected) {
    maxAllowedScore = Math.min(maxAllowedScore, 35);
    guardrailsApplied.push('manipulation_suspected');
  }
  
  // RULE 3: Screenshot with no verified sources → Score in 30-55 range
  if (imageAnalysis.credibility_flags?.is_social_media_screenshot) {
    maxAllowedScore = Math.min(maxAllowedScore, 55);
    guardrailsApplied.push('social_media_screenshot');
  }
  
  // RULE 4: High risk topic → Score capped at 50
  if (imageAnalysis.credibility_flags?.high_risk_topic) {
    maxAllowedScore = Math.min(maxAllowedScore, 50);
    guardrailsApplied.push('high_risk_topic');
  }
  
  // RULE 5: Unverifiable claims → Score capped
  if (imageAnalysis.credibility_flags?.contains_unverifiable_claims) {
    maxAllowedScore = Math.min(maxAllowedScore, 60);
    guardrailsApplied.push('unverifiable_claims');
  }
  
  // RULE 6: AI generation likely → Score capped at 40
  if (imageAnalysis.layer2_visual_integrity?.ai_generation_likelihood === 'likely') {
    maxAllowedScore = Math.min(maxAllowedScore, 40);
    guardrailsApplied.push('ai_generation_likely');
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
    ? "\n\n📋 Cette analyse multi-couche évalue la crédibilité visuelle. Les images seules ne constituent jamais une preuve définitive."
    : "\n\n📋 This multi-layer analysis evaluates visual credibility. Images alone never constitute definitive proof.";
  
  modifiedResult.explanation = (modifiedResult.explanation || '') + credibilityDisclaimer;
  
  // Enrich result with image analysis data
  modifiedResult.isScreenshotAnalysis = true;
  modifiedResult.guardrailsApplied = guardrailsApplied;
  modifiedResult.visualDescription = imageAnalysis.visual_description;
  modifiedResult.credibilityFlags = imageAnalysis.credibility_flags;
  modifiedResult.visualIntegrity = imageAnalysis.layer2_visual_integrity;
  modifiedResult.contextAnalysis = imageAnalysis.layer3_context;
  modifiedResult.plausibilityCheck = imageAnalysis.layer4_plausibility;
  modifiedResult.synthesisData = imageAnalysis.layer5_synthesis;
  modifiedResult.linguisticSignals = imageAnalysis.layer1_ocr?.linguistic_signals;
  
  return modifiedResult;
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

    console.log("Starting Multi-Layer Visual Credibility Analysis...");

    const { mimeType, data } = extractBase64Data(imageData);
    
    // Execute 5-Layer Analysis using Gemini Vision
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                text: getMultiLayerAnalysisPrompt(language || 'en')
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

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'fr' ? "Limite de requêtes atteinte. Réessayez dans quelques instants." : "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: language === 'fr' ? "Crédits IA épuisés." : "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await analysisResponse.text();
      console.error("Multi-Layer Analysis API error:", analysisResponse.status, errorText);
      throw new Error(`Analysis failed: ${analysisResponse.status}`);
    }

    const result = await analysisResponse.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No analysis response from AI");
    }

    console.log("Multi-Layer Analysis received:", content.substring(0, 600));

    // Parse analysis result
    let imageAnalysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        imageAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON in analysis response");
      }
    } catch (parseError) {
      console.error("Failed to parse analysis response:", parseError);
      // Fallback structure
      imageAnalysis = {
        layer1_ocr: {
          raw_text: "",
          cleaned_text: "",
          ocr_confidence: 0.3,
          text_length: 0,
          linguistic_signals: {
            tone: "uncertain",
            sensational_markers: [],
            certitude_level: "uncertain",
            internal_consistency: "minor_gaps"
          }
        },
        layer2_visual_integrity: {
          overall_integrity: "uncertain",
          integrity_score: 50
        },
        layer3_context: {
          explicit_claims: [],
          implied_claims: [],
          visual_text_mismatch: { detected: false }
        },
        layer4_plausibility: {
          real_world_alignment: "uncertain",
          plausibility_score: 50
        },
        layer5_synthesis: {
          visual_credibility_score: 45,
          confidence_in_assessment: "low",
          risk_level: "moderate",
          public_explanation: language === 'fr' 
            ? "L'analyse a rencontré des difficultés. Résultats limités."
            : "Analysis encountered issues. Limited results.",
          pro_explanation: language === 'fr'
            ? "L'extraction et l'analyse de l'image ont rencontré des problèmes techniques. Les résultats doivent être considérés avec prudence."
            : "Image extraction and analysis encountered technical issues. Results should be considered with caution."
        },
        credibility_flags: {
          is_social_media_screenshot: true,
          contains_unverifiable_claims: true,
          image_proves_nothing: true
        },
        visual_description: language === 'fr' 
          ? "Analyse de l'image en cours avec résultats limités."
          : "Image analysis with limited results."
      };
    }

    // Ensure credibility_flags exists
    if (!imageAnalysis.credibility_flags) {
      imageAnalysis.credibility_flags = {
        is_social_media_screenshot: true,
        contains_unverifiable_claims: true,
        image_proves_nothing: true
      };
    }
    imageAnalysis.credibility_flags.image_proves_nothing = true;

    const textToAnalyze = imageAnalysis.layer1_ocr?.cleaned_text || imageAnalysis.layer1_ocr?.raw_text || "";
    const ocrConfidence = imageAnalysis.layer1_ocr?.ocr_confidence || 0;
    
    // Calculate final score from multi-layer analysis
    const calculatedScore = calculateFinalScore(imageAnalysis);
    
    // If sufficient text, also run LeenScore text analysis for deeper insights
    let textAnalysisResult = null;
    if (textToAnalyze.length >= 10) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || 'https://clejmxumuqhpjncjuuht.supabase.co';
        const analyzeResponse = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
          method: "POST",
          headers: {
            Authorization: req.headers.get('authorization') || '',
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: textToAnalyze,
            language: language || 'en',
            analysisType: analysisType || 'standard',
            isScreenshot: true
          }),
        });

        if (analyzeResponse.ok) {
          textAnalysisResult = await analyzeResponse.json();
          textAnalysisResult = applyCredibilityGuardrails(textAnalysisResult, imageAnalysis, language || 'en');
          
          // Apply OCR confidence penalty
          if (ocrConfidence < 0.55 && textAnalysisResult.score) {
            const penalty = Math.round((0.55 - ocrConfidence) * 15);
            textAnalysisResult.score = Math.max(5, textAnalysisResult.score - penalty);
            textAnalysisResult.ocrPenaltyApplied = penalty;
          }
          
          // Blend scores: Image analysis (40%) + Text analysis (60%)
          if (textAnalysisResult.score) {
            textAnalysisResult.score = Math.round(calculatedScore * 0.4 + textAnalysisResult.score * 0.6);
            textAnalysisResult.score = Math.max(5, Math.min(98, textAnalysisResult.score));
          }
        }
      } catch (textAnalysisError) {
        console.error("Text analysis failed:", textAnalysisError);
      }
    }

    // Build comprehensive response
    const response = {
      success: true,
      multiLayerAnalysis: true,
      ocr: {
        raw_text: imageAnalysis.layer1_ocr?.raw_text || "",
        cleaned_text: textToAnalyze,
        confidence: ocrConfidence,
        text_length: textToAnalyze.length,
        linguistic_signals: imageAnalysis.layer1_ocr?.linguistic_signals
      },
      visual_integrity: imageAnalysis.layer2_visual_integrity,
      context_analysis: imageAnalysis.layer3_context,
      plausibility: imageAnalysis.layer4_plausibility,
      synthesis: imageAnalysis.layer5_synthesis,
      image_signals: {
        screenshot_likelihood: imageAnalysis.credibility_flags?.is_social_media_screenshot ? "likely" : "uncertain",
        ai_generation: imageAnalysis.layer2_visual_integrity?.ai_generation_likelihood || "uncertain",
        manipulation_risk: imageAnalysis.credibility_flags?.manipulation_suspected ? "high" : "low"
      },
      visual_text_mismatch: imageAnalysis.layer3_context?.visual_text_mismatch,
      visual_description: imageAnalysis.visual_description,
      credibility_flags: imageAnalysis.credibility_flags,
      visual_credibility_score: calculatedScore,
      analysis: textAnalysisResult,
      warning: ocrConfidence < 0.55 
        ? (language === 'fr' 
          ? "Confiance OCR faible. Le score reflète cette incertitude." 
          : "Low OCR confidence. Score reflects this uncertainty.")
        : null,
      mandatory_disclaimer: language === 'fr'
        ? "Cette analyse multi-couche évalue la crédibilité visuelle sur 5 dimensions. Les images seules ne constituent jamais une preuve définitive de faits."
        : "This multi-layer analysis evaluates visual credibility across 5 dimensions. Images alone never constitute definitive proof of claims."
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Multi-Layer Image Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Image analysis failed",
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
