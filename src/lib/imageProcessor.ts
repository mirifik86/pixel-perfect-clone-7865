/**
 * Image Processor - Client-side image optimization for OCR pipeline
 * Prevents 413 errors by compressing/resizing images before upload
 */

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
  mimeType: string;
  compressionRatio: number;
}

export interface ProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  minQuality?: number;
  targetSizeBytes?: number;
  forceJpeg?: boolean;
}

const DEFAULT_OPTIONS: Required<ProcessingOptions> = {
  maxWidth: 1800,
  maxHeight: 2400,
  initialQuality: 0.82,
  minQuality: 0.65,
  targetSizeBytes: 3.5 * 1024 * 1024, // 3.5MB
  forceJpeg: true,
};

/**
 * Check if image has transparency (requires PNG)
 */
const hasTransparency = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): boolean => {
  try {
    const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
    const data = imageData.data;
    
    // Check alpha channel for any transparency
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Load image from File or Blob
 */
const loadImage = (source: File | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(source);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
const calculateDimensions = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let newWidth = width;
  let newHeight = height;
  
  // Scale down if exceeds max width
  if (newWidth > maxWidth) {
    newHeight = Math.round((maxWidth / newWidth) * newHeight);
    newWidth = maxWidth;
  }
  
  // Scale down if still exceeds max height
  if (newHeight > maxHeight) {
    newWidth = Math.round((maxHeight / newHeight) * newWidth);
    newHeight = maxHeight;
  }
  
  return { width: newWidth, height: newHeight };
};

/**
 * Convert canvas to blob with specified quality
 */
const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      quality
    );
  });
};

/**
 * Process and optimize image for upload
 * - Resizes to max dimensions
 * - Converts to JPEG (unless transparency is needed)
 * - Progressively reduces quality to meet target size
 */
export const processImage = async (
  file: File,
  options: ProcessingOptions = {}
): Promise<ProcessedImage> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;
  
  // Load image
  const img = await loadImage(file);
  const originalWidth = img.width;
  const originalHeight = img.height;
  
  // Calculate target dimensions
  const { width, height } = calculateDimensions(
    originalWidth,
    originalHeight,
    opts.maxWidth,
    opts.maxHeight
  );
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw image
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  
  // Determine output format
  const isPng = file.type === 'image/png';
  const needsTransparency = isPng && hasTransparency(canvas, ctx);
  const outputMime = needsTransparency ? 'image/png' : 'image/jpeg';
  
  // Progressive quality reduction if needed
  let quality = opts.initialQuality;
  let blob = await canvasToBlob(canvas, outputMime, quality);
  
  // If JPEG and still too large, reduce quality progressively
  if (outputMime === 'image/jpeg') {
    while (blob.size > opts.targetSizeBytes && quality > opts.minQuality) {
      quality -= 0.05;
      blob = await canvasToBlob(canvas, outputMime, quality);
    }
  }
  
  // If still too large (PNG or JPEG at min quality), resize further
  if (blob.size > opts.targetSizeBytes) {
    const scaleFactor = Math.sqrt(opts.targetSizeBytes / blob.size) * 0.9;
    canvas.width = Math.round(width * scaleFactor);
    canvas.height = Math.round(height * scaleFactor);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    blob = await canvasToBlob(canvas, outputMime, opts.minQuality);
  }
  
  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    originalSize,
    processedSize: blob.size,
    mimeType: outputMime,
    compressionRatio: originalSize / blob.size,
  };
};

/**
 * Validate image before processing
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPEG, PNG ou WebP.',
    };
  }
  
  if (file.size > MAX_ORIGINAL_SIZE) {
    return {
      valid: false,
      error: 'Image trop volumineuse (max 10 Mo). Choisissez une image plus petite.',
    };
  }
  
  return { valid: true };
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};
