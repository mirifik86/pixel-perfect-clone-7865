import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UrlToVerify {
  url: string;
  name: string;
  snippet: string;
}

interface VerificationResult {
  url: string;
  originalUrl: string;
  isValid: boolean;
  finalUrl: string;
  status: number;
  reason?: string;
}

// Paths that indicate homepage/generic landing
const GENERIC_PATHS = new Set([
  '/', '/home', '/index', '/news', '/about', '/contact',
  '/search', '/404', '/error', '/not-found'
]);

// Check if path is too short/generic
const isGenericPath = (pathname: string): boolean => {
  const normalized = pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (GENERIC_PATHS.has(normalized)) return true;
  
  // Very short paths (e.g., /a, /ab) are likely generic
  const segments = normalized.split('/').filter(s => s.length > 0);
  if (segments.length === 0) return true;
  if (segments.length === 1 && segments[0].length <= 3) return true;
  
  return false;
};

// Extract key terms from snippet for relevance check
const extractKeyTerms = (text: string): string[] => {
  if (!text) return [];
  return text.toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-ZÀ-ÿ0-9]/g, ''))
    .filter(w => w.length > 4);
};

// Verify a single URL
const verifyUrl = async (item: UrlToVerify): Promise<VerificationResult> => {
  const { url, snippet } = item;
  const result: VerificationResult = {
    url,
    originalUrl: url,
    isValid: false,
    finalUrl: url,
    status: 0,
  };

  try {
    // Try HEAD first (lighter), fallback to GET
    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    // Use browser-like user agent to avoid 403s from anti-bot protections
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };

    try {
      response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers,
      });
      
      // If HEAD returns 403/405, try GET (some servers block HEAD)
      if (response.status === 403 || response.status === 405) {
        response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers,
        });
      }
    } catch {
      // HEAD failed, try GET
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers,
      });
    }
    
    clearTimeout(timeout);

    result.status = response.status;
    result.finalUrl = response.url || url;

    // Reject clearly dead links
    if (response.status === 404 || response.status === 410 ||
        response.status === 429 || response.status >= 500) {
      result.reason = `HTTP ${response.status}`;
      return result;
    }

    // Check if domain is trusted (for 403 handling)
    const trustedDomains = [
      'britannica.com', 'wikipedia.org', 'nature.com', 'sciencedirect.com',
      'ncbi.nlm.nih.gov', 'pubmed.gov', 'cdc.gov', 'who.int', 'nih.gov',
      'nasa.gov', 'bbc.com', 'nytimes.com', 'reuters.com', 'apnews.com'
    ];
    const hostname = new URL(url).hostname.toLowerCase();
    const isTrusted = trustedDomains.some(d => hostname.includes(d)) || 
                      hostname.endsWith('.gov') || hostname.endsWith('.edu');

    // Accept 2xx, 3xx, and 403 for trusted domains (anti-bot but page exists)
    const acceptableStatus = (response.status >= 200 && response.status < 400) || 
                             (response.status === 403 && isTrusted);
    if (!acceptableStatus) {
      result.reason = `HTTP ${response.status}`;
      return result;
    }

    // Check if redirected to generic page
    try {
      const finalUrlParsed = new URL(result.finalUrl);
      if (isGenericPath(finalUrlParsed.pathname)) {
        // Check if snippet keywords appear in final URL (some relevance)
        const keyTerms = extractKeyTerms(snippet);
        const urlLower = result.finalUrl.toLowerCase();
        const hasRelevance = keyTerms.some(term => urlLower.includes(term));
        
        if (!hasRelevance) {
          result.reason = 'Redirected to generic page';
          return result;
        }
      }
    } catch {
      // URL parsing failed, but we already have a response
    }

    // All checks passed
    result.isValid = true;
    return result;

  } catch (error) {
    result.reason = error instanceof Error ? error.message : 'Network error';
    return result;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json() as { urls: UrlToVerify[] };

    if (!urls || !Array.isArray(urls)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'urls' array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit to prevent abuse
    const urlsToVerify = urls.slice(0, 20);

    // Verify all URLs in parallel (with concurrency limit)
    const results: VerificationResult[] = [];
    const batchSize = 5;
    
    for (let i = 0; i < urlsToVerify.length; i += batchSize) {
      const batch = urlsToVerify.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(verifyUrl));
      results.push(...batchResults);
    }

    // Deduplicate by domain + final URL path
    const seen = new Set<string>();
    const deduped = results.map(r => {
      if (!r.isValid) return r;
      
      try {
        const parsed = new URL(r.finalUrl);
        const key = `${parsed.hostname}${parsed.pathname}`.toLowerCase();
        if (seen.has(key)) {
          return { ...r, isValid: false, reason: 'Duplicate' };
        }
        seen.add(key);
        return r;
      } catch {
        return r;
      }
    });

    return new Response(
      JSON.stringify({ results: deduped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-urls:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});