import { useState } from "react";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = { name: "", email: "", message: "" };
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Nombre requerido";
      valid = false;
    }

    if (!formData.email.includes("@")) {
      newErrors.email = "Email invalido";
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensaje requerido";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    alert("Mensaje enviado");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section className="page">
      <div className="container">
        <form onSubmit={handleSubmit} className="card mx-auto max-w-xl space-y-3 p-5">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Contacto</h1>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre"
            className="field"
          />
          {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="field"
          />
          {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Mensaje"
            className="field h-28"
          />
          {errors.message && <p className="text-sm text-red-400">{errors.message}</p>}

          <button type="submit" className="btn btn-primary w-full">
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;