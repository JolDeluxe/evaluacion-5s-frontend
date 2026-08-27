export async function procesarImagen(file) {
  // Fallback direct to original file if native canvas or createImageBitmap APIs are not available
  if (
    typeof window === 'undefined' ||
    !window.createImageBitmap ||
    !window.HTMLCanvasElement ||
    !window.OffscreenCanvas && !document.createElement
  ) {
    return file;
  }

  // Only process files that are images
  if (!file.type?.startsWith('image/')) {
    return file;
  }

  try {
    // createImageBitmap automatically decodes EXIF orientation metadata by default
    // we explicitly request 'from-image' to guarantee browser decodes rotation correctly.
    const bitmap = await window.createImageBitmap(file, { imageOrientation: 'from-image' });

    try {
      const originalWidth = bitmap.width;
      const originalHeight = bitmap.height;

      // 5S image maximum side length is 1600px
      const MAX_SIDE = 1600;
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (originalWidth > MAX_SIDE || originalHeight > MAX_SIDE) {
        if (originalWidth > originalHeight) {
          targetWidth = MAX_SIDE;
          targetHeight = Math.round((originalHeight * MAX_SIDE) / originalWidth);
        } else {
          targetHeight = MAX_SIDE;
          targetWidth = Math.round((originalWidth * MAX_SIDE) / originalHeight);
        }
      }

      // Initialize canvas
      let canvas;
      let ctx;
      if (typeof window.OffscreenCanvas !== 'undefined') {
        canvas = new window.OffscreenCanvas(targetWidth, targetHeight);
        ctx = canvas.getContext('2d');
      } else {
        canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx = canvas.getContext('2d');
      }

      if (!ctx) {
        bitmap.close();
        return file;
      }

      // Draw bitmap inside canvas with new dimensions
      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();

      // Convert canvas to blob (preferably webp, falling back to original mime type)
      const outputMime = 'image/webp';
      const outputQuality = 0.80;

      if (typeof canvas.convertToBlob === 'function') {
        const blob = await canvas.convertToBlob({ type: outputMime, quality: outputQuality });
        const nameWebp = file.name.replace(/\.[^/.]+$/, '') + '.webp';
        return new File([blob], nameWebp, { type: outputMime, lastModified: Date.now() });
      } else {
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const nameWebp = file.name.replace(/\.[^/.]+$/, '') + '.webp';
              const optimizedFile = new File([blob], nameWebp, {
                type: blob.type || outputMime,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            },
            outputMime,
            outputQuality
          );
        });
      }
    } catch (innerErr) {
      if (bitmap && typeof bitmap.close === 'function') {
        bitmap.close();
      }
      return file;
    }
  } catch (err) {
    // If decoding or creating ImageBitmap fails, fallback gracefully to original file
    return file;
  }
}
