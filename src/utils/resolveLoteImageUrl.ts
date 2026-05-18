import { API_ORIGIN } from "../services/apiClient";

export const resolveLoteImageUrl = (image: string | null | undefined) => {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  if (image.startsWith("/")) return `${API_ORIGIN}${image}`;
  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
};
