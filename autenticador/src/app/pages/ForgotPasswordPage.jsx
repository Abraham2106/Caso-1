import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import AuthCard from "../components/auth/AuthCard";
import AuthField from "../components/auth/AuthField";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;
const GENERIC_MESSAGE = "Si el correo existe, enviamos instrucciones.";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const redirectTo = useMemo(() => {
    const publicUrl = import.meta.env.VITE_PUBLIC_URL;
    const basePath = import.meta.env.BASE_URL ?? "/";
    const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
    const baseUrl = publicUrl || window.location.origin;
    return `${baseUrl}${normalizedBase}reset-password`;
  }, []);

  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Campo obligatorio";
    }

    if (!EMAIL_REGEX.test(value.trim())) {
      return "Correo invalido";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateEmail(email);
    setError(validationError);

    if (validationError) {
      toast.error("Revise el correo ingresado.");
      return;
    }

    setIsLoading(true);
    const result = await requestPasswordReset(email.trim(), redirectTo);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    setIsSubmitted(true);
    toast.success(result.message || GENERIC_MESSAGE);
  };

  const resetState = () => {
    setEmail("");
    setError("");
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <AuthCard title="Revise su correo">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-[#107c10] text-white">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <p className="mb-6 text-center text-[14px] text-[#605e5c]">{GENERIC_MESSAGE}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetState}
            className="h-10 flex-1 rounded-[2px] border border-[#e1e1e1] bg-white px-4 text-[14px] font-medium text-[#323130] transition hover:bg-[#f3f3f3]"
          >
            Usar otro correo
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="h-10 flex-1 rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe]"
          >
            Volver
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recuperar contrasena"
      subtitle="Ingrese su correo para recibir instrucciones."
    >
      <div className="mb-5 rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3 text-[13px] text-[#605e5c]">
        Se enviara un enlace para restablecer su contrasena.
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Correo electronico"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          error={error}
          disabled={isLoading}
          autoComplete="email"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Enviando..." : "Enviar enlace"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          disabled={isLoading}
          className="h-10 w-full rounded-[2px] border border-[#e1e1e1] bg-white px-4 text-[14px] font-medium text-[#323130] transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Volver a la pagina principal
        </button>
      </form>
    </AuthCard>
  );
}

export default ForgotPasswordPage;

