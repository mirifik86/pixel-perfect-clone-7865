/**
 * Engine Client - Unified API service with timeout, retry, and normalized errors.
 * 
 * This module abstracts the analysis engine calls, making it easy to switch backends
 * by changing only environment variables (VITE_ENGINE_URL, VITE_ENGINE_KEY).
 */

// Environment configuration with sensible defaults
const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || '';
const ENGINE_KEY = import.meta.env.VITE_ENGINE_KEY || '';
const ENGINE_TIMEOUT = Number(import.meta.env.VITE_ENGINE_TIMEOUT_MS) || 20000;

export interface EngineError {
  code: string;
  message: string;
}

export interface EngineResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: EngineError;
}

export interface AnalysisPayload {
  type: 'url' | 'image' | 'text';
  content: string; // URL, base64 image, or text content
  mode: 'standard' | 'pro';
  lang: 'en' | 'fr';
}

export interface AnalysisJobResponse {
  analysisId: string;
  status?: 'queued' | 'running' | 'done' | 'error';
}

export interface AnalysisStatusResponse {
  status: 'queued' | 'running' | 'done' | 'error';
  result?: unknown;
  error?: string;
}

/**
 * Safe fetch wrapper with AbortController timeout and normalized error handling.
 */
async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = ENGINE_TIMEOUT
): Promise<EngineResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 4xx errors are not retried
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        ok: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorText || `Request failed with status ${response.status}`,
        },
      };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return {
          ok: false,
          error: { code: 'TIMEOUT', message: 'Request timed out' },
        };
      }
      return {
        ok: false,
        error: { code: 'NETWORK_ERROR', message: err.message },
      };
    }

    return {
      ok: false,
      error: { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' },
    };
  }
}

/**
 * Fetch with ONE retry on network failure/timeout (not on 4xx).
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = ENGINE_TIMEOUT
): Promise<EngineResult<T>> {
  const result = await safeFetch<T>(url, options, timeoutMs);

  // Retry only on network errors or timeouts, not on 4xx
  if (!result.ok && result.error) {
    const isRetryable = ['TIMEOUT', 'NETWORK_ERROR'].includes(result.error.code);
    if (isRetryable) {
      console.log('[engineClient] Retrying after:', result.error.code);
      // Wait 1 second before retry
      await new Promise((r) => setTimeout(r, 1000));
      return safeFetch<T>(url, options, timeoutMs);
    }
  }

  return result;
}

/**
 * Build authorization headers if ENGINE_KEY is present.
 */
function buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (ENGINE_KEY) {
    headers['Authorization'] = `Bearer ${ENGINE_KEY}`;
  }

  return headers;
}

/**
 * Check if the external engine is configured.
 * Returns false if we should use Supabase functions instead.
 */
export function isExternalEngineConfigured(): boolean {
  return Boolean(ENGINE_URL);
}

/**
 * Submit an analysis job to the engine.
 */
export async function submitAnalysis(
  payload: AnalysisPayload
): Promise<EngineResult<AnalysisJobResponse>> {
  if (!ENGINE_URL) {
    return {
      ok: false,
      error: { code: 'NOT_CONFIGURED', message: 'Engine URL not configured' },
    };
  }

  return fetchWithRetry<AnalysisJobResponse>(`${ENGINE_URL}/analyze`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
}

/**
 * Poll for analysis status.
 */
export async function getAnalysisStatus(
  analysisId: string
): Promise<EngineResult<AnalysisStatusResponse>> {
  if (!ENGINE_URL) {
    return {
      ok: false,
      error: { code: 'NOT_CONFIGURED', message: 'Engine URL not configured' },
    };
  }

  return fetchWithRetry<AnalysisStatusResponse>(
    `${ENGINE_URL}/analyze/${analysisId}`,
    {
      method: 'GET',
      headers: buildHeaders(),
    }
  );
}

/**
 * Session storage helpers for resuming analysis.
 */
const STORAGE_KEY = 'leenscore:lastAnalysisId';

export function saveAnalysisId(analysisId: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, analysisId);
  } catch {
    // Ignore storage errors (e.g., private browsing)
  }
}

export function getLastAnalysisId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearAnalysisId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
