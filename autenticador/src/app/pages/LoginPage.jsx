import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthCard from "../components/auth/AuthCard";
import AuthField from "../components/auth/AuthField";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      nextErrors.email = "Campo obligatorio";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Correo invalido";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Campo obligatorio";
    }

    return nextErrors;
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
    const result = await login(formData.email.trim(), formData.password);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setTimeout(() => navigate("/dashboard"), 300);
  };

  return (
    <AuthCard title="Iniciar sesion" subtitle="Acceda con su cuenta para continuar.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
          id="password"
          name="password"
          type="password"
          label="Contrasena"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link to="/forgot-password" className="text-[14px] text-[#0078D4]">
            &iquest;Olvido su contrasena?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Iniciando sesion..." : "Iniciar sesion"}
        </button>
      </form>

      <div className="mt-6 border-t border-[#e1e1e1] pt-4 text-center text-[14px] text-[#605e5c]">
        &iquest;No tiene cuenta?{" "}
        <Link to="/register" className="text-[#0078D4]">
          Registrarse
        </Link>
      </div>
    </AuthCard>
  );
}

export default LoginPage;


