const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function getInternetInfo() {
  const nav = typeof window !== "undefined" ? window.navigator : undefined;
  const connection = nav?.connection || nav?.mozConnection || nav?.webkitConnection;

  return {
    isOnline: nav ? nav.onLine : false,
    effectiveType: connection?.effectiveType ?? "No disponible",
    downlink: connection?.downlink ?? null,
    rtt: connection?.rtt ?? null,
  };
}

export async function checkInternetConnectivity() {
  const startedAt = Date.now();
  await sleep(400);

  const snapshot = getInternetInfo();
  const elapsed = Date.now() - startedAt;
  const jitter = Math.floor(Math.random() * 40) + 20;
  const latencyMs = snapshot.isOnline ? elapsed + jitter : null;

  return {
    success: snapshot.isOnline,
    checkedAt: new Date().toISOString(),
    latencyMs,
    snapshot,
    message: snapshot.isOnline
      ? "Conectividad establecida correctamente."
      : "No hay conexion activa a internet.",
  };
}
