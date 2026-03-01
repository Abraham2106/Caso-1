import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthCard from "../components/auth/AuthCard";
import AuthField from "../components/auth/AuthField";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors = {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      nextErrors.name = "Campo obligatorio";
    }

    if (!formData.username.trim()) {
      nextErrors.username = "Campo obligatorio";
    } else if (!/^[a-zA-Z0-9._-]{3,30}$/.test(formData.username.trim())) {
      nextErrors.username = "Usuario invalido";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Campo obligatorio";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Correo invalido";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Campo obligatorio";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Minimo 6 caracteres";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Campo obligatorio";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Las contrasenas no coinciden";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Revise los campos marcados.");
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    if (result.user) {
      setTimeout(() => navigate("/dashboard"), 300);
      return;
    }

    setTimeout(() => navigate("/login"), 300);
  };

  return (
    <AuthCard title="Crear cuenta" subtitle="Registre un usuario para acceder al sistema.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="name"
          name="name"
          type="text"
          label="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
          autoComplete="name"
        />

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Correo electronico"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
        />

        <AuthField
          id="username"
          name="username"
          type="text"
          label="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          disabled={isLoading}
          autoComplete="username"
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Contrasena"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
          autoComplete="new-password"
        />

        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmar contrasena"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={isLoading}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <Link
          to="/"
          className={`flex h-10 w-full items-center justify-center rounded-[2px] border border-[#e1e1e1] bg-white px-4 text-[14px] font-medium text-[#323130] transition hover:bg-[#f3f3f3] ${
            isLoading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Volver a la pagina principal
        </Link>
      </form>

      <div className="mt-6 border-t border-[#e1e1e1] pt-4 text-center text-[14px] text-[#605e5c]">
        &iquest;Ya tiene cuenta?{" "}
        <Link to="/login" className="text-[#0078D4]">
          Iniciar sesion
        </Link>
      </div>
    </AuthCard>
  );
}

export default RegisterPage;



