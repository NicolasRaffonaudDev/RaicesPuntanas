import type { Lote } from "../types/interfaces";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const siteConfig = {
  brandName: "Raices Puntanas",
  brandSubtitle: "Tierra, inversion y futuro",
  contactEmail: "contacto@raicespuntanas.com",
  whatsappNumber: "+54 9 0000 000000",
  instagramUrl: "https://instagram.com/raicespuntanas",
  defaultContactMessage: "Hola, quiero recibir asesoramiento sobre lotes disponibles.",
  businessLocationLabel: "San Luis, Argentina",
} as const;

export const getWhatsAppBaseUrl = () => `https://wa.me/${onlyDigits(siteConfig.whatsappNumber)}`;

const getSiteOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin.replace(/\/+$/, "");
};

export const buildLoteWhatsAppUrl = (lote?: Pick<Lote, "title" | "address"> | null) => {
  const baseMessage = buildDefaultLoteContactMessage(lote);
  return `${getWhatsAppBaseUrl()}?text=${encodeURIComponent(baseMessage)}`;
};

export const buildDefaultLoteContactMessage = (lote?: Pick<Lote, "title" | "address"> | null) => {
  if (!lote) return siteConfig.defaultContactMessage;
  return `Hola, quiero consultar por el lote: ${lote.title}${lote.address ? ` (${lote.address})` : ""}`;
};

export const buildLoteMailtoUrl = (lote?: Pick<Lote, "id" | "title" | "address"> | null) => {
  const subject = lote ? `Consulta por lote ${lote.title}` : "Consulta comercial";
  const loteUrl = lote ? `${getSiteOrigin()}/lotes/${lote.id}` : "";
  const bodyLines = [
    buildDefaultLoteContactMessage(lote),
    loteUrl ? `Link del lote: ${loteUrl}` : "",
  ].filter(Boolean);

  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n\n"))}`;
};
