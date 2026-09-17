import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

export const procesarImagen = async (file) => {
  try {
    let fileToCompress = file;
    const mimeLower = (file.type || '').toLowerCase();
    const nameLower = (file.name || '').toLowerCase();
    const isHeic =
      mimeLower.includes('heic') ||
      mimeLower.includes('heif') ||
      nameLower.endsWith('.heic') ||
      nameLower.endsWith('.heif');

    // 1. Transcodificar HEIC/HEIF a JPEG si es necesario
    if (isHeic) {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.75,
      });

      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      fileToCompress = new File([blob], newName, { type: 'image/jpeg' });
    }

    // 2. Compresión rápida: target 250 KB para redes lentas de planta
    //    initialQuality 0.75 converge más rápido que 0.8 → menos iteraciones internas
    const options = {
      maxSizeMB: 0.25,           // 250 KB — buen equilibrio velocidad/calidad para evidencias 5S
      maxWidthOrHeight: 1280,    // Bajado de 1600: fotos de auditoría no necesitan 1600px
      useWebWorker: true,        // No bloquea UI
      fileType: 'image/webp',
      initialQuality: 0.75,
      alwaysKeepResolution: false,
    };

    const compressedBlob = await imageCompression(fileToCompress, options);

    const finalName = fileToCompress.name.replace(/\.[^/.]+$/, '.webp');
    return new File([compressedBlob], finalName, { type: 'image/webp' });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    return file;
  }
};
