/**
 * Image Uploader - Handles Supabase Storage uploads
 * Uploads processed images and returns URLs for edge function
 */

import { supabase } from "@/integrations/supabase/client";
import { processImage, validateImage, formatBytes, type ProcessedImage } from "./imageProcessor";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  processedImage?: ProcessedImage;
  path?: string;
}

export type UploadProgressCallback = (
  stage: "validating" | "optimizing" | "uploading" | "complete",
  progress?: number,
) => void;

const BUCKET_NAME = "uploads";
const UPLOAD_PATH_PREFIX = "leenscore";

/**
 * Generate a unique file path for the upload
 */
const generateFilePath = (mimeType: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = mimeType === "image/png" ? "png" : "jpg";

  // Use 'anon' for anonymous uploads
  return `${UPLOAD_PATH_PREFIX}/anon/${timestamp}-${random}.${extension}`;
};

/**
 * Upload an image to Supabase Storage
 * 1. Validates the image
 * 2. Processes/compresses it
 * 3. Uploads to storage
 * 4. Returns the public URL
 */
export const uploadImage = async (file: File, onProgress?: UploadProgressCallback): Promise<UploadResult> => {
  try {
    // Step 1: Validate
    onProgress?.("validating");
    const validation = validateImage(file);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Step 2: Process/compress
    onProgress?.("optimizing");
    const processedImage = await processImage(file);

    console.log(
      `Image processed: ${formatBytes(processedImage.originalSize)} → ${formatBytes(processedImage.processedSize)} ` +
        `(${processedImage.compressionRatio.toFixed(1)}x compression)`,
    );

    // Step 3: Upload to storage
    onProgress?.("uploading");
    const filePath = generateFilePath(processedImage.mimeType);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, processedImage.blob, {
        contentType: processedImage.mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        error: `Échec du téléchargement: ${uploadError.message}`,
      };
    }

    // Step 4: Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Impossible d'obtenir l'URL de l'image",
      };
    }

    onProgress?.("complete");

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      processedImage,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur de téléchargement",
    };
  }
};

/**
 * Delete an uploaded image from storage
 */
export const deleteUploadedImage = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    return !error;
  } catch {
    return false;
  }
};

/**
 * Analyze an image via the edge function
 * Uses URL-based approach to avoid 413 errors
 */
export interface AnalysisResult {
  success: boolean;
  error?: string;
  debugId?: string;
  ocr?: {
    raw_text: string;
    cleaned_text: string;
    confidence: number;
    text_length: number;
  };
  image_signals?: any;
  analysis?: any;
  warnings?: string[];
  warning?: string;
  visual_text_mismatch?: any;
  visual_description?: string;
  ocr_success?: boolean;
  ocr_error?: string;
  [key: string]: any;
}

export const analyzeImageViaUrl = async (
  imageUrl: string,
  originalFilename: string,
  mimeType: string,
  language: string = "en",
  analysisType: "standard" | "pro" = "standard",
): Promise<AnalysisResult> => {
  try {
    const res = await supabase.functions.invoke("analyze-image", {
      body: {
        image_url: imageUrl,
        original_filename: originalFilename,
        mime: mimeType,
        language,
        analysisType,
        mode: "ocr+vision",
      },
    });

    // Handle Supabase function errors
    if (res.error) {
      console.error("Edge function error:", res.error);
      return {
        success: false,
        error: res.error.message || "Analyse impossible",
        debugId: res.error.context?.debugId || undefined,
      };
    }

    const data = res.data;

    // Handle API-level errors in response body
    if (data?.error && !data?.success) {
      console.error("API returned error:", data.error, "debugId:", data.debugId);
      return {
        success: false,
        error: data.error,
        debugId: data.debugId || data.requestId || undefined,
      };
    }

    // Return successful result
    return {
      success: true,
      ...data,
      debugId: data.debugId || data.requestId || undefined,
    };
  } catch (error: any) {
    console.error("analyzeImageViaUrl error:", error);
    return {
      success: false,
      error: error?.message || "Erreur inattendue lors de l'analyse",
      debugId: error?.debugId || undefined,
    };
  }
};
