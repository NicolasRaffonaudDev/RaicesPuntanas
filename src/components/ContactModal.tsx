import { useEffect, useMemo, useRef, useState } from "react";
import type { Lote } from "../types/interfaces";
import { commercialApi } from "../services/commercialApi";

interface ContactModalProps {
  isOpen: boolean;
  lote: Lote | null;
  onClose: () => void;
}

const buildDefaultMessage = (lote: Lote | null) => {
  if (!lote) return "";
  const address = lote.address ? ` (${lote.address})` : "";
  return `Hola, quiero consultar por el lote ${lote.title}${address}.`;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, lote, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const nameRef = useRef<HTMLInputElement | null>(null);

  const defaultMessage = useMemo(() => buildDefaultMessage(lote), [lote]);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setEmail("");
    setMessage(defaultMessage);
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    setSubmitError("");
    const timeout = window.setTimeout(() => nameRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [defaultMessage, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lote) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { name?: string; email?: string; message?: string } = {};

    if (!name.trim()) nextErrors.name = "Ingresa tu nombre.";
    if (!email.trim() || !isValidEmail(email)) nextErrors.email = "Ingresa un email valido.";
    if (!message.trim()) nextErrors.message = "Ingresa un mensaje.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setIsSuccess(false);
    setSubmitError("");

    try {
      await commercialApi.createInquiry({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        loteId: lote.id,
      });
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo enviar la consulta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    setSubmitError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="card w-full max-w-xl p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Contacto</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Consultar lote</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{lote.title}</p>
          </div>
          <button type="button" className="btn btn-outline text-sm" onClick={handleClose}>
            Cerrar
          </button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="contact-name" className="text-sm text-[var(--color-text-muted)]">
              Nombre
            </label>
            <input
              id="contact-name"
              ref={nameRef}
              className="field"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && <p className="text-xs text-red-300">{errors.name}</p>}
          </div>

          <div className="grid gap-1">
            <label htmlFor="contact-email" className="text-sm text-[var(--color-text-muted)]">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
          </div>

          <div className="grid gap-1">
            <label htmlFor="contact-message" className="text-sm text-[var(--color-text-muted)]">
              Mensaje
            </label>
            <textarea
              id="contact-message"
              rows={4}
              className="field"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            {errors.message && <p className="text-xs text-red-300">{errors.message}</p>}
          </div>

          {submitError && (
            <p className="rounded border border-red-700/40 bg-red-900/30 px-3 py-2 text-sm text-red-300">
              {submitError || "No se pudo enviar la consulta"}
            </p>
          )}
          {isSuccess && (
            <p className="rounded border border-emerald-700/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
              Consulta enviada correctamente.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
