const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api/v1';
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '/placeholder.svg';
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed === '/placeholder.png' || trimmed === 'placeholder.png' || trimmed === '/placeholder.svg') {
    return '/placeholder.svg';
  }

  // Already a full URL or data URI
  if (/^(http|https|data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  // Relative Laravel backend storage or uploads path
  if (trimmed.startsWith('/storage/')) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }
  if (trimmed.startsWith('storage/')) {
    return `${BACKEND_ORIGIN}/${trimmed}`;
  }
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    return `${BACKEND_ORIGIN}/${trimmed.replace(/^\//, '')}`;
  }

  // Relative path starting with /
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `${BACKEND_ORIGIN}/storage/${trimmed}`;
}
