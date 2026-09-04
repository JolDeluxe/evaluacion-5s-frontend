const DEFAULT_PUBLIC_PORTAL_URL = 'https://5s-mbc.netlify.app';

export function getPublicPortalBaseUrl() {
  const envUrl = import.meta.env?.VITE_PUBLIC_PORTAL_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_PUBLIC_PORTAL_URL;
}

export function buildAreaQrUrl(codigoVerificacion) {
  if (!codigoVerificacion) return null;
  const baseUrl = getPublicPortalBaseUrl();
  const code = String(codigoVerificacion).trim().toUpperCase();
  return `${baseUrl}/q/${encodeURIComponent(code)}`;
}

export function getPrintedDisplayUrl() {
  const envUrl = import.meta.env?.VITE_PUBLIC_PORTAL_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    try {
      const parsed = new URL(envUrl.trim());
      return parsed.hostname;
    } catch {
      // Fallback
    }
  }
  return '5s-mbc.netlify.app';
}

export function normalizeAreaCode(str) {
  return (str ?? '').trim().toUpperCase().replace(/[\s-]/g, '');
}

export function parseAreaQrPayload(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const cleaned = rawInput.trim();
  if (!cleaned) return null;

  // Si es una URL (ej. https://5s-mbc.netlify.app/q/YCE5-K78Y o http://localhost:5173/q/YCE5-K78Y)
  if (cleaned.includes('/q/')) {
    try {
      const url = new URL(cleaned);
      const parts = url.pathname.split('/q/');
      if (parts.length > 1 && parts[1]) {
        const extracted = decodeURIComponent(parts[1].split('/')[0]).trim().toUpperCase();
        return extracted || null;
      }
    } catch {
      const match = cleaned.match(/\/q\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        return match[1].trim().toUpperCase();
      }
    }
  }

  // Si es un código directo
  const normalized = normalizeAreaCode(cleaned);
  // Los códigos de verificación típicamente tienen caracteres alfanuméricos
  if (/^[A-Z0-9]+$/.test(normalized)) {
    return cleaned.trim().toUpperCase();
  }

  return null;
}

