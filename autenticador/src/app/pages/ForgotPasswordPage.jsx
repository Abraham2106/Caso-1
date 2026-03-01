import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const baseInputClass =
  "h-10 w-full rounded-[2px] border px-3 text-[14px] text-[#323130] placeholder:text-[#605e5c] outline-none transition focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#f3f3f3]";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

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
    toast.info("Enviando enlace de recuperacion...");
    await sleep(800);
    setIsLoading(false);

    setSubmittedEmail(email.trim());
    setIsSubmitted(true);
    toast.success("Enlace enviado correctamente.");
  };

  const resetState = () => {
    setEmail("");
    setError("");
    setSubmittedEmail("");
    setIsSubmitted(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-[2px] border border-[#e1e1e1] bg-white p-8">
        {!isSubmitted ? (
          <>
            <h1 className="mb-1 text-[24px] font-semibold text-[#323130]">
              Recuperar contrasena
            </h1>
            <p className="mb-4 text-[14px] text-[#605e5c]">
              Ingrese su correo para recibir instrucciones.
            </p>

            <div className="mb-5 rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3 text-[13px] text-[#605e5c]">
              Se enviara enlace para restablecer su contrasena al correo indicado.
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                  className={`${baseInputClass} ${
                    error ? "border-[#a4262c]" : "border-[#e1e1e1]"
                  }`}
                  autoComplete="email"
                />
                {error && (
                  <p className="mt-1 flex items-center gap-1 text-[12px] text-[#a4262c]">
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
              </div>

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
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-[#107c10] text-white">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <h1 className="mb-2 text-center text-[24px] font-semibold text-[#323130]">
              Revise su correo
            </h1>
            <p className="mb-6 text-center text-[14px] text-[#605e5c]">
              Se envio un enlace de recuperacion a <strong>{submittedEmail}</strong>.
            </p>

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
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
