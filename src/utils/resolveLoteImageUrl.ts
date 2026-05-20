const SVG_PLACEHOLDER = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <rect width="800" height="500" fill="#0f0f10" />
    <rect x="28" y="28" width="744" height="444" rx="28" fill="#18181b" stroke="#2f2f33" stroke-width="4" />
    <circle cx="230" cy="205" r="48" fill="#2d2d31" />
    <path d="M112 366l142-124 92 86 106-114 145 152H112z" fill="#3b3b40" />
    <text x="50%" y="82%" text-anchor="middle" fill="#d4af37" font-family="Arial, sans-serif" font-size="34">
      Imagen no disponible
    </text>
  </svg>
`);

export const LOTE_IMAGE_FALLBACK_SRC = `data:image/svg+xml;charset=UTF-8,${SVG_PLACEHOLDER}`;

const getFrontendOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://localhost";
};

export const resolveLoteImageUrl = (image: string | null | undefined) => {
  if (!image) return LOTE_IMAGE_FALLBACK_SRC;

  const trimmed = image.trim();
  if (!trimmed) return LOTE_IMAGE_FALLBACK_SRC;

  if (/^(data:|blob:)/i.test(trimmed)) return trimmed;

  const frontendOrigin = getFrontendOrigin();

  if (trimmed.startsWith("/uploads/")) {
    return `${frontendOrigin}${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${frontendOrigin}${parsed.pathname}${parsed.search}`;
      }
      return parsed.toString();
    } catch {
      return LOTE_IMAGE_FALLBACK_SRC;
    }
  }

  if (trimmed.startsWith("/")) {
    return `${frontendOrigin}${trimmed}`;
  }

  return `${frontendOrigin}/${trimmed.replace(/^\/+/, "")}`;
};
