import { Stethoscope } from "lucide-react";
import { sectionCardClass } from "./dashboardStyles";

function HealthSection({ healthResult, isCheckingHealth, onCheckHealth }) {
  return (
    <section className={sectionCardClass}>
      <div className="mb-4 flex items-center gap-2">
        <Stethoscope size={16} className="text-[#0078D4]" />
        <h3 className="text-[16px] font-semibold text-[#323130]">Salud del sistema</h3>
      </div>

      <p className="mb-4 text-[13px] text-[#605e5c]">
        Ping a la base de datos para verificar operacion de Supabase.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
          <p className="text-[12px] text-[#605e5c]">Estado</p>
          <p
            className={`text-[14px] font-medium ${
              !healthResult
                ? "text-[#605e5c]"
                : healthResult.success
                  ? "text-[#107c10]"
                  : "text-[#a4262c]"
            }`}
          >
            {!healthResult
              ? "Sin verificar"
              : healthResult.success
                ? "Operativo"
                : "Falla"}
          </p>
        </div>

        <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
          <p className="text-[12px] text-[#605e5c]">Latencia</p>
          <p className="text-[14px] font-medium text-[#323130]">
            {healthResult ? `${healthResult.latencyMs} ms` : "No disponible"}
          </p>
        </div>

        <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
          <p className="text-[12px] text-[#605e5c]">Ultima verificacion</p>
          <p className="text-[14px] font-medium text-[#323130]">
            {healthResult
              ? new Date(healthResult.checkedAt).toLocaleString("es-CR")
              : "Sin verificar"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCheckHealth}
          disabled={isCheckingHealth}
          className="h-10 rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCheckingHealth ? "Verificando..." : "Hacer ping a base de datos"}
        </button>

        <p className="text-[13px] text-[#605e5c]">
          {healthResult?.stats
            ? `users: ${healthResult.stats.users} | data_records: ${healthResult.stats.dataRecords}`
            : "Sin metricas de registros"}
        </p>
      </div>

      {!healthResult?.success && healthResult?.detail ? (
        <p className="mt-3 text-[12px] text-[#a4262c]">{healthResult.detail}</p>
      ) : null}
    </section>
  );
}

export default HealthSection;
