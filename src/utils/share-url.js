import { ENV } from '@/config/env';

const isLocalHost = (url) => {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

export function getPublicAppBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin && !isLocalHost(window.location.origin)) {
    return window.location.origin.replace(/\/+$/, '');
  }
  if (ENV.PUBLIC_APP_URL && !isLocalHost(ENV.PUBLIC_APP_URL)) return ENV.PUBLIC_APP_URL;
  return '';
}

export function buildPublicAppUrl(path) {
  const baseUrl = getPublicAppBaseUrl();
  if (!baseUrl) return '';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function copyToClipboard(text) {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  return ok;
}
