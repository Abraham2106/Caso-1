import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthCard from "../components/auth/AuthCard";
import AuthField from "../components/auth/AuthField";
import { useAuth } from "../contexts/AuthContext";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = { password: "", confirmPassword: "" };

    if (!formData.password.trim()) {
      nextErrors.password = "Campo obligatorio";
    } else if (formData.password.trim().length < 6) {
      nextErrors.password = "Minimo 6 caracteres";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Campo obligatorio";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Las contrasenas no coinciden";
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
    const result = await updatePassword(formData.password.trim());
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    setIsDone(true);
    toast.success(result.message);
  };

  return (
    <AuthCard
      title="Definir nueva contrasena"
      subtitle="Ingrese una nueva contrasena para su cuenta."
    >
      {isDone ? (
        <div className="space-y-4">
          <p className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3 text-[14px] text-[#323130]">
            Su contrasena se actualizo correctamente.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="h-10 w-full rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe]"
          >
            Ir a iniciar sesion
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <AuthField
            id="password"
            name="password"
            type="password"
            label="Nueva contrasena"
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
            label="Confirmar nueva contrasena"
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
            {isLoading ? "Actualizando..." : "Actualizar contrasena"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={isLoading}
            className="h-10 w-full rounded-[2px] border border-[#e1e1e1] bg-white px-4 text-[14px] font-medium text-[#323130] transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Volver a iniciar sesion
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default ResetPasswordPage;

