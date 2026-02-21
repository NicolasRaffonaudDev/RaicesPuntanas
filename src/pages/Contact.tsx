import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";

const Contact: React.FC = () => {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialAsunto = searchParams.get("asunto") ?? "";
  const initialLoteId = searchParams.get("loteId") ?? "";

  const [formData, setFormData] = useState({
    asunto: initialAsunto,
    loteId: initialLoteId,
    mensaje: "",
  });
  const [errors, setErrors] = useState({ asunto: "", loteId: "", mensaje: "" });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = { asunto: "", loteId: "", mensaje: "" };
    let valid = true;

    if (!formData.asunto.trim()) {
      newErrors.asunto = "Asunto requerido";
      valid = false;
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = "Mensaje requerido";
      valid = false;
    }

    if (formData.loteId) {
      const loteId = Number(formData.loteId);
      if (!Number.isInteger(loteId) || loteId <= 0) {
        newErrors.loteId = "ID de lote invalido";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const canSend = useMemo(() => !!token && !!user, [token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      setStatus("Debes iniciar sesion para enviar consultas.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    try {
      await commercialApi.createConsulta(token, {
        asunto: formData.asunto.trim(),
        mensaje: formData.mensaje.trim(),
        loteId: formData.loteId ? Number(formData.loteId) : undefined,
      });
      setStatus("Consulta enviada correctamente.");
      setFormData({ asunto: initialAsunto, loteId: initialLoteId, mensaje: "" });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "No se pudo enviar la consulta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="container">
        <form onSubmit={handleSubmit} className="card mx-auto max-w-xl space-y-3 p-5">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Contacto</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {user ? `Sesion activa: ${user.name} (${user.role})` : "Inicia sesion para enviar una consulta."}
          </p>

          {!canSend && (
            <p className="rounded border border-amber-700 bg-amber-950/30 p-2 text-sm text-amber-300">
              Necesitas autenticarte. <Link to="/login" className="underline">Ir a login</Link>
            </p>
          )}

          <input
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            placeholder="Asunto"
            className="field"
          />
          {errors.asunto && <p className="text-sm text-red-400">{errors.asunto}</p>}

          <input
            name="loteId"
            value={formData.loteId}
            onChange={handleChange}
            placeholder="ID de lote (opcional)"
            className="field"
          />
          {errors.loteId && <p className="text-sm text-red-400">{errors.loteId}</p>}

          <textarea
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Mensaje"
            className="field h-28"
          />
          {errors.mensaje && <p className="text-sm text-red-400">{errors.mensaje}</p>}
          {status && <p className="text-sm text-[var(--color-text-muted)]">{status}</p>}

          <button type="submit" className="btn btn-primary w-full" disabled={!canSend || submitting}>
            {submitting ? "Enviando..." : "Enviar consulta"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
