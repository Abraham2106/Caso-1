import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const baseInputClass =
  "h-10 w-full rounded-[2px] border px-3 text-[14px] text-[#323130] placeholder:text-[#605e5c] outline-none transition focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#f3f3f3]";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      nextErrors.name = "Campo obligatorio";
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
    setTimeout(() => navigate("/dashboard"), 300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-[2px] border border-[#e1e1e1] bg-white p-8">
        <h1 className="mb-1 text-[24px] font-semibold text-[#323130]">
          Crear cuenta
        </h1>
        <p className="mb-6 text-[14px] text-[#605e5c]">
          Registre un usuario para acceder al sistema.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-[14px] font-medium text-[#323130]"
            >
              Nombre completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`${baseInputClass} ${
                errors.name ? "border-[#a4262c]" : "border-[#e1e1e1]"
              }`}
              autoComplete="name"
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-[12px] text-[#a4262c]">
                <AlertCircle size={14} />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[14px] font-medium text-[#323130]"
            >
              Correo electronico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`${baseInputClass} ${
                errors.email ? "border-[#a4262c]" : "border-[#e1e1e1]"
              }`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-[12px] text-[#a4262c]">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-[14px] font-medium text-[#323130]"
            >
              Contrasena
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`${baseInputClass} ${
                errors.password ? "border-[#a4262c]" : "border-[#e1e1e1]"
              }`}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-[12px] text-[#a4262c]">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-[14px] font-medium text-[#323130]"
            >
              Confirmar contrasena
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`${baseInputClass} ${
                errors.confirmPassword ? "border-[#a4262c]" : "border-[#e1e1e1]"
              }`}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-[12px] text-[#a4262c]">
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </p>
            )}
          </div>

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
          ¿Ya tiene cuenta?{" "}
          <Link to="/login" className="text-[#0078D4]">
            Iniciar sesion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
