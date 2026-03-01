import { pingDatabase } from "../../data/repositories/healthRepository";

const now = () =>
  typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();

export async function checkSystemHealth() {
  const startedAt = now();
  const { usersPing, dataPing } = await pingDatabase();
  const latencyMs = Math.round(now() - startedAt);
  const checkedAt = new Date().toISOString();

  const usersError = usersPing.error;
  const dataError = dataPing.error;

  if (usersError || dataError) {
    return {
      success: false,
      checkedAt,
      latencyMs,
      message: "Fallo el ping a la base de datos.",
      detail: usersError?.message ?? dataError?.message ?? "Sin detalle.",
    };
  }

  return {
    success: true,
    checkedAt,
    latencyMs,
    message: "Base de datos operativa.",
    stats: {
      users: usersPing.count ?? 0,
      dataRecords: dataPing.count ?? 0,
    },
  };
}
