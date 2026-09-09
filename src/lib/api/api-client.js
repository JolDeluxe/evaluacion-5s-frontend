import { ENV } from '@/config/env';

export class ApiError extends Error {
  constructor(message, { status = 0, codigo = null, detalles = null, data = null, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${ENV.API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiRequest(path, options = {}) {
  const { body, headers, signal, ...rest } = options;
  const hasBody = body !== undefined && body !== null;

  let response;
  try {
    response = await fetch(buildUrl(path), {
      credentials: 'include',
      signal,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch (error) {
    throw new ApiError(error?.message || 'No se pudo conectar con el servidor.', {
      isNetworkError: true,
    });
  }

  const data = await parseBody(response);

  if (!response.ok) {
    const backendError = typeof data?.error === 'object' && data.error !== null ? data.error : null;
    const message = backendError?.mensaje
      || backendError?.message
      || data?.mensaje
      || data?.message
      || (typeof data?.error === 'string' ? data.error : null)
      || `Error ${response.status}`;

    throw new ApiError(message, {
      status: response.status,
      codigo: backendError?.codigo ?? data?.codigo ?? null,
      detalles: backendError?.detalles ?? data?.detalles ?? null,
      data,
    });
  }

  return data;
}

export async function apiDownload(path, options = {}) {
  const { headers, signal, ...rest } = options;

  let response;
  try {
    response = await fetch(buildUrl(path), {
      credentials: 'include',
      signal,
      headers: {
        Accept: 'application/pdf, application/octet-stream, */*',
        ...headers,
      },
      ...rest,
    });
  } catch (error) {
    throw new ApiError(error?.message || 'No se pudo conectar con el servidor.', {
      isNetworkError: true,
    });
  }

  if (!response.ok) {
    const data = await parseBody(response);
    const backendError = typeof data?.error === 'object' && data.error !== null ? data.error : null;
    const message = backendError?.mensaje
      || backendError?.message
      || data?.mensaje
      || data?.message
      || (typeof data?.error === 'string' ? data.error : null)
      || `Error ${response.status}`;

    throw new ApiError(message, {
      status: response.status,
      codigo: backendError?.codigo ?? data?.codigo ?? null,
      detalles: backendError?.detalles ?? data?.detalles ?? null,
      data,
    });
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition');
  let filename = null;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match?.[1]) {
      filename = match[1].replace(/['"]/g, '').trim();
    }
  }

  return { blob, filename };
}

export function triggerBrowserDownload(blob, fallbackFilename = 'archivo.pdf') {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fallbackFilename;
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 150);
}

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
  download: (path, options) => apiDownload(path, { ...options, method: 'GET' }),
};

