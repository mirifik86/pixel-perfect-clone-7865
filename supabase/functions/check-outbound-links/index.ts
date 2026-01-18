import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security: Block private IP ranges and non-http(s) schemes
const BLOCKED_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^localhost$/i,
];

const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.io',
  'is.gd', 'v.gd', 'buff.ly', 'ift.tt', 'j.mp', 'rb.gy', 'cutt.ly',
  'shorturl.at', 'tiny.cc', 'shorte.st', 'adf.ly', 'bc.vc', 'po.st',
  'mcaf.ee', 'su.pr', 'lnkd.in', 'db.tt', 'qr.ae', 'rebrand.ly',
  'bl.ink', 'soo.gd', 'clck.ru', 's.id', 'rotf.lol', 'shortlink.de'
];

const SUSPICIOUS_TLDS = [
  '.top', '.xyz', '.click', '.live', '.work', '.date', '.download',
  '.stream', '.gdn', '.loan', '.racing', '.review', '.trade', '.win',
  '.bid', '.accountant', '.science', '.party', '.cricket', '.faith',
  '.men', '.cf', '.ga', '.gq', '.ml', '.tk', '.zip', '.mov', '.icu',
  '.cam', '.monster', '.rest', '.hair', '.quest', '.uno', '.sbs'
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'account', 'wallet', 'claim', 'giveaway', 'bonus',
  'free', 'password', 'seed', 'recovery', 'support', 'urgent', 'confirm',
  'secure', 'update', 'suspended', 'limited', 'expire', 'validate',
  'authenticate', 'unlock', 'restore', 'reward', 'winner', 'prize',
  'jackpot', 'crypto', 'airdrop', 'mint', 'nft', 'token', 'binance',
  'metamask', 'coinbase', 'ledger', 'trezor', 'paypal', 'bank'
];

const TRACKING_PARAMS = [
  'gclid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_term', 'utm_content', 'mc_eid', 'mc_cid', 'msclkid', '_ga',
  'ref', 'affiliate', 'aff_id', 'partner', 'source', 'campaign_id'
];

interface LinkAnalysis {
  url: string;
  domain: string;
  label: 'Safe' | 'Unknown' | 'Suspicious';
  reasons: string[];
  riskScore: number;
}

interface OutboundLinksResult {
  success: boolean;
  links: LinkAnalysis[];
  totalFound: number;
  analyzed: number;
  proAvailable: boolean;
  proMessage?: string;
  error?: string;
}

// Check if hostname appears to be a private IP
function isBlockedHost(hostname: string): boolean {
  return BLOCKED_IP_PATTERNS.some(pattern => pattern.test(hostname));
}

// Normalize and validate URL
function normalizeUrl(href: string, baseUrl: string): string | null {
  try {
    // Handle relative URLs
    const url = new URL(href, baseUrl);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    
    // Block private IPs
    if (isBlockedHost(url.hostname)) {
      return null;
    }
    
    return url.href;
  } catch {
    return null;
  }
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// Check if it's the same domain as the source
function isSameDomain(linkUrl: string, sourceUrl: string): boolean {
  try {
    const link = new URL(linkUrl);
    const source = new URL(sourceUrl);
    return link.hostname === source.hostname;
  } catch {
    return false;
  }
}

// Analyze a single link with heuristics
function analyzeLink(url: string, language: 'en' | 'fr'): LinkAnalysis {
  const reasons: string[] = [];
  let riskScore = 0;
  const domain = extractDomain(url);
  const lowerUrl = url.toLowerCase();
  const lowerDomain = domain.toLowerCase();

  const t = {
    en: {
      urlShortener: 'URL shortener detected - destination hidden',
      suspiciousTld: 'Uses high-risk TLD commonly abused',
      punycode: 'Internationalized domain (potential lookalike)',
      suspiciousKeywords: 'Contains suspicious keywords in URL',
      excessiveTracking: 'Multiple tracking parameters',
      longQuery: 'Unusually long query string',
      manySubdomains: 'Many subdomains (potential obfuscation)',
      longDomain: 'Unusually long domain name',
      https: 'Uses HTTPS encryption',
      wellKnown: 'Well-known domain',
    },
    fr: {
      urlShortener: 'Raccourcisseur d\'URL - destination masquée',
      suspiciousTld: 'Extension à haut risque souvent abusée',
      punycode: 'Domaine internationalisé (potentiel sosie)',
      suspiciousKeywords: 'Contient des mots-clés suspects dans l\'URL',
      excessiveTracking: 'Multiples paramètres de suivi',
      longQuery: 'Chaîne de requête anormalement longue',
      manySubdomains: 'Nombreux sous-domaines (possible obscurcissement)',
      longDomain: 'Nom de domaine anormalement long',
      https: 'Utilise le chiffrement HTTPS',
      wellKnown: 'Domaine bien connu',
    }
  };
  const tr = t[language];

  // 1. URL shortener detection
  if (URL_SHORTENERS.some(s => lowerDomain === s || lowerDomain.endsWith('.' + s))) {
    reasons.push(tr.urlShortener);
    riskScore += 25;
  }

  // 2. Suspicious TLD
  if (SUSPICIOUS_TLDS.some(tld => lowerDomain.endsWith(tld))) {
    reasons.push(tr.suspiciousTld);
    riskScore += 20;
  }

  // 3. Punycode/IDN detection
  if (domain.includes('xn--') || /[^\x00-\x7F]/.test(domain)) {
    reasons.push(tr.punycode);
    riskScore += 15;
  }

  // 4. Suspicious keywords in path/query
  const urlPath = lowerUrl.split('?')[0] + (lowerUrl.split('?')[1] || '');
  const foundKeywords = SUSPICIOUS_KEYWORDS.filter(kw => urlPath.includes(kw));
  if (foundKeywords.length >= 2) {
    reasons.push(tr.suspiciousKeywords);
    riskScore += 20;
  } else if (foundKeywords.length === 1) {
    riskScore += 8;
  }

  // 5. Excessive tracking params
  try {
    const urlObj = new URL(url);
    const trackingCount = TRACKING_PARAMS.filter(p => urlObj.searchParams.has(p)).length;
    if (trackingCount >= 3) {
      reasons.push(tr.excessiveTracking);
      riskScore += 10;
    }
    
    // Very long query string
    if (urlObj.search.length > 200) {
      reasons.push(tr.longQuery);
      riskScore += 10;
    }
  } catch {}

  // 6. Many subdomains
  const subdomainCount = domain.split('.').length - 2;
  if (subdomainCount >= 3) {
    reasons.push(tr.manySubdomains);
    riskScore += 15;
  }

  // 7. Very long domain
  if (domain.length > 50) {
    reasons.push(tr.longDomain);
    riskScore += 10;
  }

  // Positive signals (reduce risk)
  if (url.startsWith('https://')) {
    if (reasons.length === 0) reasons.push(tr.https);
    riskScore -= 5;
  }

  // Well-known domains (basic whitelist for context)
  const wellKnownDomains = [
    'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com',
    'instagram.com', 'linkedin.com', 'github.com', 'wikipedia.org',
    'amazon.com', 'apple.com', 'microsoft.com', 'bbc.com', 'cnn.com',
    'nytimes.com', 'reuters.com', 'theguardian.com', 'lemonde.fr',
    'lefigaro.fr', 'liberation.fr', 'gov.uk', 'gouv.fr', 'europa.eu'
  ];
  if (wellKnownDomains.some(wd => lowerDomain === wd || lowerDomain.endsWith('.' + wd))) {
    if (reasons.length === 0) reasons.push(tr.wellKnown);
    riskScore -= 20;
  }

  // Clamp score
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Determine label
  let label: 'Safe' | 'Unknown' | 'Suspicious';
  if (riskScore >= 30) {
    label = 'Suspicious';
  } else if (riskScore >= 10) {
    label = 'Unknown';
  } else {
    label = 'Safe';
  }

  // Limit to 4 reasons max
  const finalReasons = reasons.slice(0, 4);

  return {
    url,
    domain,
    label,
    reasons: finalReasons.length > 0 ? finalReasons : [language === 'fr' ? 'Aucun signal de risque détecté' : 'No risk signals detected'],
    riskScore
  };
}

// Extract links from HTML
function extractLinks(html: string, sourceUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const normalized = normalizeUrl(href, sourceUrl);
    if (normalized && !isSameDomain(normalized, sourceUrl)) {
      links.push(normalized);
    }
  }

  // Deduplicate and limit
  const uniqueLinks = [...new Set(links)];
  
  // Prefer unique domains (up to 10)
  const domainMap = new Map<string, string>();
  for (const link of uniqueLinks) {
    const domain = extractDomain(link);
    if (!domainMap.has(domain)) {
      domainMap.set(domain, link);
    }
    if (domainMap.size >= 10) break;
  }

  return Array.from(domainMap.values());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, language = 'en', analysisType = 'standard' } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required", links: [], totalFound: 0, analyzed: 0, proAvailable: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
      if (isBlockedHost(targetUrl.hostname)) {
        throw new Error('Blocked host');
      }
    } catch {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: language === 'fr' ? "URL invalide" : "Invalid URL", 
          links: [], 
          totalFound: 0, 
          analyzed: 0, 
          proAvailable: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching outbound links from: ${url}`);

    // Fetch HTML with strict limits
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    let html: string;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'LeenScore/1.0 (+https://leenscore.com)',
          'Accept': 'text/html',
        },
        redirect: 'follow', // Deno follows up to 20 by default, we trust this
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Limit response size (500KB max)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 500000) {
        throw new Error('Response too large');
      }

      html = await response.text();
      
      // Truncate if too large
      if (html.length > 500000) {
        html = html.substring(0, 500000);
      }
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: language === 'fr' ? "Impossible de récupérer la page" : "Unable to fetch page", 
          links: [], 
          totalFound: 0, 
          analyzed: 0, 
          proAvailable: false 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract and analyze links
    const extractedLinks = extractLinks(html, url);
    const analyzedLinks = extractedLinks.map(link => analyzeLink(link, language as 'en' | 'fr'));

    // Sort by risk (most suspicious first)
    analyzedLinks.sort((a, b) => b.riskScore - a.riskScore);

    // Pro analysis placeholder (reputation check would go here)
    const isPro = analysisType === 'pro';
    let proMessage: string | undefined;
    
    if (isPro) {
      // In a real implementation, this would call an external reputation API
      proMessage = language === 'fr' 
        ? "Vérification de réputation non disponible. Affichage des résultats heuristiques uniquement."
        : "Reputation check unavailable. Showing heuristic results only.";
    }

    const result: OutboundLinksResult = {
      success: true,
      links: analyzedLinks,
      totalFound: extractedLinks.length,
      analyzed: analyzedLinks.length,
      proAvailable: isPro,
      proMessage: isPro ? proMessage : undefined
    };

    console.log(`Found ${result.totalFound} outbound links, analyzed ${result.analyzed}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error checking outbound links:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal error", 
        links: [], 
        totalFound: 0, 
        analyzed: 0, 
        proAvailable: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
