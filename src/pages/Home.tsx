import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <section className="page">
      <div className="container">
        <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.22),_transparent_58%)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">Gestion Comercial</p>
            <h1 className="text-4xl font-bold sm:text-5xl">Raices Puntanas</h1>
            <p className="text-lg text-[var(--color-text-muted)]">
              Plataforma para gestionar lotes, clientes, ventas e inventario con una base profesional y escalable.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link className="btn btn-primary" to="/lotes">
                Ver Lotes
              </Link>
              <Link className="btn btn-outline" to="/login">
                Acceso al Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;