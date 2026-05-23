import lotePlaceholderSrc from "../assets/lote-placeholder.webp";

interface LoteImageCandidate {
  url?: string | null;
}

interface LoteWithImagesLike {
  image?: string | null;
  imagenes?: Array<LoteImageCandidate | string | null> | null;
}

export const LOTE_IMAGE_FALLBACK_SRC = lotePlaceholderSrc;

const getFrontendOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "http://localhost";
};

const normalizeUploadsPath = (value: string) => {
  if (value.startsWith("/uploads/")) return value;
  if (value.startsWith("uploads/")) return `/${value}`;
  return value;
};

const getNormalizedImageValue = (image: string | null | undefined) => {
  if (typeof image !== "string") return null;
  const trimmed = image.trim();
  if (!trimmed) return null;
  return normalizeUploadsPath(trimmed);
};

const getImageValueFromCandidate = (candidate: LoteImageCandidate | string | null | undefined) => {
  if (!candidate) return null;
  if (typeof candidate === "string") return getNormalizedImageValue(candidate);
  return getNormalizedImageValue(candidate.url);
};

export const getPrimaryLoteImage = (lote: LoteWithImagesLike | null | undefined) => {
  if (!lote) return null;

  const firstGalleryImage = lote.imagenes?.map((candidate) => getImageValueFromCandidate(candidate)).find(Boolean) ?? null;
  return firstGalleryImage ?? getNormalizedImageValue(lote.image);
};

export const getPrimaryLoteImagePath = getPrimaryLoteImage;

export const resolveLoteImageUrl = (image: string | null | undefined) => {
  const normalized = getNormalizedImageValue(image);
  if (!normalized) return LOTE_IMAGE_FALLBACK_SRC;

  if (/^(data:|blob:)/i.test(normalized)) {
    return normalized;
  }

  const frontendOrigin = getFrontendOrigin();

  if (normalized.startsWith("/uploads/")) {
    return `${frontendOrigin}${normalized}`;
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${frontendOrigin}${parsed.pathname}${parsed.search}`;
      }
      return parsed.toString();
    } catch {
      return LOTE_IMAGE_FALLBACK_SRC;
    }
  }

  if (normalized.startsWith("/")) {
    return `${frontendOrigin}${normalized}`;
  }

  return `${frontendOrigin}/${normalized.replace(/^\/+/, "")}`;
};

export const resolvePrimaryLoteImageUrl = (lote: LoteWithImagesLike | null | undefined) =>
  resolveLoteImageUrl(getPrimaryLoteImage(lote));
