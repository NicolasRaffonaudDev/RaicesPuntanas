import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { authApi } from "../services/authApi";

const Login: React.FC = () => {
  const { establishSession, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectPending, setRedirectPending] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTarget = useMemo(() => {
    const state = location.state as { from?: Location } | null;
    return state?.from?.pathname || "/dashboard";
  }, [location.state]);

  useEffect(() => {
    if (!redirectPending) return;
    if (!user || !token) return;
    navigate(redirectTarget, { replace: true });
  }, [redirectPending, user, token, navigate, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await authApi.login(form);
      establishSession(session);
      setRedirectPending(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No fue posible iniciar sesion";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="container">
        <form onSubmit={handleSubmit} className="card mx-auto max-w-md space-y-4 p-5">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Ingresar</h1>
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
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "Validando..." : "Entrar"}
          </button>
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            Si no existe admin, usa <Link to="/setup-admin" className="text-[var(--color-primary)]">setup admin</Link>.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
