import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get current date for temporal context
const getCurrentDateInfo = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    formatted: now.toISOString().split('T')[0]
  };
};

const getSystemPrompt = (language: string) => `You are LeenScore, an AI credibility analyst. Your task is to analyze content and calculate a Trust Score.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}. All text including reasons and summary must be in ${language === 'fr' ? 'French' : 'English'}.

CURRENT DATE CONTEXT:
Today's date is ${getCurrentDateInfo().formatted} (${getCurrentDateInfo().year}).
You MUST use this as your temporal reference point for all date evaluations.

SCORING METHOD:
Start with a base score of 50/100 (neutral).
Apply the following criteria by adding or subtracting points:

A. SOURCES & CORROBORATION:
- Multiple independent sources confirm the information: +20
- Recognized or reputable source: +15
- Single or unknown source: -15
- No verifiable source: -25

B. FACTUAL CONSISTENCY:
- Facts internally coherent and consistent: +20
- Major contradictions detected: -20
- Assertions without clear evidence: -10

C. TONE & LANGUAGE:
- Neutral, informative tone: +10
- Emotional, alarmist, or sensational tone: -15
- Excessive use of trigger words ("shocking", "revealed", "hidden truth"): -10

D. CONTEXT CLARITY:
- Clear temporal and geographical context: +10
- Incomplete or misleading context: -15
- Information presented outside its original context: -20

TEMPORAL CONTEXT EVALUATION (CRITICAL):
When evaluating publication dates:
1. Compare detected dates against TODAY'S DATE (${getCurrentDateInfo().formatted})
2. A date in ${getCurrentDateInfo().year} is CURRENT YEAR content - this is NORMAL and expected
3. Apply NO penalty for:
   - Same year and month as current date
   - Dates within ±30 days of current date
   - Content clearly labeled as forecasts, projections, or future-oriented
4. Apply context penalty (-15 to -20) ONLY if:
   - Date is more than 60 days in the future AND not clearly forward-looking content
   - Date appears fabricated or contradicts the content narrative
5. When uncertain about dates, state uncertainty - do NOT penalize

E. TRANSPARENCY:
- Sources clearly cited: +10
- Identified author or organization: +5
- Total anonymity: -10

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "factual": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "tone": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "context": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "transparency": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"}
  },
  "summary": "<2-3 sentence explanation in ${language === 'fr' ? 'French' : 'English'}>",
  "confidence": "<low|medium|high>"
}

IMPORTANT:
- Score must be between 0 and 100
- Be objective and analytical
- When data is insufficient, state uncertainty instead of penalizing
- The summary should explain why the score is what it is
- NEVER penalize content simply because it mentions dates in ${getCurrentDateInfo().year} - that is the CURRENT YEAR
- ALL text responses (reasons, summary) MUST be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}`;

// Input validation
const MAX_CONTENT_LENGTH = 50000; // 50KB max content

const validateInput = (content: string): { valid: boolean; error?: string } => {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: "Content is required and must be a string" };
  }
  
  if (content.trim().length === 0) {
    return { valid: false, error: "Content cannot be empty" };
  }
  
  if (content.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` };
  }
  
  return { valid: true };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.log("JWT validation failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.user.id;
    console.log(`Authenticated request from user: ${userId}`);

    // Parse and validate request body
    const { content, language } = await req.json();
    
    // Validate input
    const validation = validateInput(content);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate language parameter
    const validLanguage = language === 'fr' || language === 'en' ? language : 'en';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = validLanguage === 'fr' 
      ? `Analyse ce contenu et calcule le Trust Score. Réponds en français:\n\n${content}`
      : `Analyze this content and calculate the Trust Score:\n\n${content}`;

    console.log(`Calling Lovable AI Gateway for analysis (user: ${userId}, lang: ${validLanguage})...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getSystemPrompt(validLanguage) },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: validLanguage === 'fr' ? "Limite de requêtes atteinte. Réessayez dans quelques instants." : "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: validLanguage === 'fr' ? "Crédits IA épuisés. Veuillez ajouter des crédits dans Settings → Workspace → Usage." : "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const messageContent = aiResponse.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("No response from AI");
    }

    console.log(`AI response received for user ${userId}:`, messageContent.substring(0, 200));

    // Parse the JSON response from AI
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response if parsing fails
      analysisResult = {
        score: 50,
        breakdown: {
          sources: { points: 0, reason: "Unable to analyze sources" },
          factual: { points: 0, reason: "Unable to verify facts" },
          tone: { points: 0, reason: "Unable to assess tone" },
          context: { points: 0, reason: "Unable to evaluate context" },
          transparency: { points: 0, reason: "Unable to check transparency" }
        },
        summary: "Analysis could not be completed. Please try again with clearer content.",
        confidence: "low"
      };
    }

    // Ensure score is within bounds
    analysisResult.score = Math.max(0, Math.min(100, analysisResult.score));

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
