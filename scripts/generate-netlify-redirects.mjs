import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const redirectsPath = resolve(__dirname, '../public/_redirects');
const rawTarget = process.env.NETLIFY_API_PROXY_TARGET?.trim() || '';
const isNetlifyBuild = process.env.NETLIFY === 'true';

function normalizeApiTarget(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('NETLIFY_API_PROXY_TARGET debe iniciar con https:// o http://');
  }

  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) {
    throw new Error('NETLIFY_API_PROXY_TARGET no puede apuntar a localhost.');
  }

  const pathname = url.pathname.replace(/\/+$/, '');
  const apiPath = pathname.endsWith('/api/v1') ? pathname : `${pathname}/api/v1`;
  return `${url.origin}${apiPath}`;
}

const lines = [];

if (rawTarget) {
  const apiTarget = normalizeApiTarget(rawTarget);
  lines.push(`/api/v1/* ${apiTarget}/:splat 200`);
} else if (isNetlifyBuild) {
  throw new Error('Configura NETLIFY_API_PROXY_TARGET con la URL publica del Cloudflare Tunnel antes de desplegar en Netlify.');
}

lines.push('/* /index.html 200');

mkdirSync(dirname(redirectsPath), { recursive: true });
writeFileSync(redirectsPath, `${lines.join('\n')}\n`, 'utf8');
