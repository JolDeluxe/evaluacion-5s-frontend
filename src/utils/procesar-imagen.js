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
        quality: 0.8, // Calidad intermedia antes de la compresión final
      });

      // heic2any puede devolver un array de blobs, tomamos el primero
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

      // Reconstruir el archivo
      const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      fileToCompress = new File([blob], newName, { type: 'image/jpeg' });
    }

    // 2. Compresión Agresiva y control de dimensiones
    const options = {
      maxSizeMB: 0.3, // Máximo 300KB por foto (ideal para redes lentas)
      maxWidthOrHeight: 1600, // Evita fotos de 4K
      useWebWorker: true, // No bloquea la interfaz de usuario
      fileType: 'image/webp', // Formato de última generación
      initialQuality: 0.8,
    };

    const compressedBlob = await imageCompression(fileToCompress, options);

    // Devolver como objeto File
    const finalName = fileToCompress.name.replace(/\.[^/.]+$/, '.webp');
    return new File([compressedBlob], finalName, { type: 'image/webp' });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    // Si la compresión falla, fallback devolviendo el archivo original
    return file;
  }
};
