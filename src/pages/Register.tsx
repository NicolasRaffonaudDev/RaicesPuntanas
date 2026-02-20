import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No fue posible crear la cuenta";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="container">
        <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4 p-5">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Crear cuenta</h1>

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
            required
            minLength={6}
            placeholder="Contrasena"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}

          <button className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
