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
