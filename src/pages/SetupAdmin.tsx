import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { authApi } from "../services/authApi";

const SetupAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { establishSession } = useAuth();

  const [form, setForm] = useState({
    setupKey: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await authApi.setupAdmin(form);
      establishSession(session);
      navigate("/gestion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="container">
        <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4 p-5">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Bootstrap Admin</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Usa tu setup key del backend para crear el primer usuario administrador.
          </p>

          <input
            className="field"
            required
            placeholder="Setup key"
            value={form.setupKey}
            onChange={(e) => setForm((prev) => ({ ...prev, setupKey: e.target.value }))}
          />
          <input
            className="field"
            required
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="field"
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <input
            className="field"
            type="password"
            minLength={8}
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear admin"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SetupAdmin;