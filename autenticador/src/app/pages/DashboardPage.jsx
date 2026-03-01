import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Globe,
  Layers,
  Mail,
  PencilLine,
  Shield,
  Trash2,
  User,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react";
import pako from "pako";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  checkInternetConnectivity,
  getInternetInfo,
} from "../business/services/internetService";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-10 w-full rounded-[2px] border border-[#e1e1e1] px-3 text-[14px] text-[#323130] outline-none transition focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#f3f3f3]";

const sectionCardClass = "rounded-[2px] border border-[#e1e1e1] bg-white p-6";

const adminUmlText = `@startuml
title Modelo UML - Arquitectura en 3 Capas (Sistema Autenticador)

skinparam componentStyle rectangle
skinparam packageStyle rectangle
left to right direction

package "Capa de Presentación\\n(UI - React)" {
  component "Vistas\\n(Login, Register,\\nDashboard)" as UI
  component "Rutas\\n(ProtectedRoute)" as ROUTES
  component "Contexto de Autenticación\\n(AuthContext)" as CONTEXT
}

package "Capa de Negocio\\n(Lógica de Aplicación)" {
  component "Auth Service\\n(Reglas de autenticación)" as AUTH_SVC
  component "User Service\\n(Gestión de usuarios)" as USER_SVC
  component "Data Service\\n(Reglas de datos)" as DATA_SVC
  component "Internet Service\\n(Conectividad)" as NET_SVC
}

package "Capa de Datos\\n(Acceso a Datos)" {
  component "User Repository" as USER_REPO
  component "Data Repository" as DATA_REPO
  component "Supabase Client" as SUPABASE
}

database "Supabase\\n(users, data_records)" as DB

' Relaciones entre capas
UI --> CONTEXT
ROUTES --> CONTEXT

CONTEXT --> AUTH_SVC
CONTEXT --> USER_SVC
CONTEXT --> DATA_SVC

UI --> NET_SVC

AUTH_SVC --> USER_REPO
USER_SVC --> USER_REPO
DATA_SVC --> DATA_REPO

USER_REPO --> SUPABASE
DATA_REPO --> SUPABASE
SUPABASE --> DB

note right of UI
Interfaz basada en roles:
- Admin: gestión + visualización avanzada
- User: dashboard de solo lectura
end note
@enduml`;

function encode6bit(value) {
  if (value < 10) {
    return String.fromCharCode(48 + value);
  }

  if (value < 36) {
    return String.fromCharCode(55 + value);
  }

  if (value < 62) {
    return String.fromCharCode(61 + value);
  }

  if (value === 62) {
    return "-";
  }

  if (value === 63) {
    return "_";
  }

  return "?";
}

function append3bytes(byte1, byte2, byte3) {
  const c1 = byte1 >> 2;
  const c2 = ((byte1 & 0x3) << 4) | (byte2 >> 4);
  const c3 = ((byte2 & 0xf) << 2) | (byte3 >> 6);
  const c4 = byte3 & 0x3f;

  return (
    encode6bit(c1 & 0x3f) +
    encode6bit(c2 & 0x3f) +
    encode6bit(c3 & 0x3f) +
    encode6bit(c4 & 0x3f)
  );
}

function encode64(data) {
  let result = "";

  for (let index = 0; index < data.length; index += 3) {
    if (index + 2 === data.length) {
      result += append3bytes(data[index], data[index + 1], 0);
    } else if (index + 1 === data.length) {
      result += append3bytes(data[index], 0, 0);
    } else {
      result += append3bytes(data[index], data[index + 1], data[index + 2]);
    }
  }

  return result;
}

function encodePlantUml(text) {
  const bytes = new TextEncoder().encode(text);
  const compressed = pako.deflateRaw(bytes, { level: 9 });
  return encode64(compressed);
}

function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    users,
    dataItems,
    logout,
    createUserAccount,
    deleteUserAccount,
    createDataItem,
    updateDataItem,
    deleteDataItem,
  } = useAuth();

  const isAdmin = user?.role === "admin";

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [userErrors, setUserErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [dataForm, setDataForm] = useState({ key: "", value: "" });
  const [dataErrors, setDataErrors] = useState({ key: "", value: "" });
  const [editingDataId, setEditingDataId] = useState(null);
  const [isSavingData, setIsSavingData] = useState(false);

  const [internetInfo, setInternetInfo] = useState(() => getInternetInfo());
  const [isCheckingInternet, setIsCheckingInternet] = useState(false);
  const [lastInternetCheck, setLastInternetCheck] = useState(null);
  const [umlLoadError, setUmlLoadError] = useState(false);

  const umlImageUrl = useMemo(() => {
    try {
      return `https://www.plantuml.com/plantuml/svg/${encodePlantUml(adminUmlText)}`;
    } catch (error) {
      console.error(error);
      return "";
    }
  }, []);

  useEffect(() => {
    const updateSnapshot = () => {
      setInternetInfo(getInternetInfo());
    };

    updateSnapshot();

    window.addEventListener("online", updateSnapshot);
    window.addEventListener("offline", updateSnapshot);

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    connection?.addEventListener?.("change", updateSnapshot);

    return () => {
      window.removeEventListener("online", updateSnapshot);
      window.removeEventListener("offline", updateSnapshot);
      connection?.removeEventListener?.("change", updateSnapshot);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Sesion cerrada correctamente.");
    navigate("/login", { replace: true });
  };

  const validateUserForm = () => {
    const nextErrors = { name: "", email: "", password: "" };

    if (!userForm.name.trim()) {
      nextErrors.name = "Campo obligatorio";
    }

    if (!userForm.email.trim()) {
      nextErrors.email = "Campo obligatorio";
    } else if (!EMAIL_REGEX.test(userForm.email.trim())) {
      nextErrors.email = "Correo invalido";
    }

    if (!userForm.password.trim()) {
      nextErrors.password = "Campo obligatorio";
    } else if (userForm.password.trim().length < 6) {
      nextErrors.password = "Minimo 6 caracteres";
    }

    return nextErrors;
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    const nextErrors = validateUserForm();
    setUserErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Revise los datos del usuario.");
      return;
    }

    setIsSavingUser(true);
    const result = await createUserAccount(userForm);
    setIsSavingUser(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setUserForm({ name: "", email: "", password: "" });
    setUserErrors({ name: "", email: "", password: "" });
  };

  const handleDeleteUser = async (email) => {
    const result = await deleteUserAccount(email);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  };

  const validateDataForm = () => {
    const nextErrors = { key: "", value: "" };

    if (!dataForm.key.trim()) {
      nextErrors.key = "Campo obligatorio";
    }

    if (!dataForm.value.trim()) {
      nextErrors.value = "Campo obligatorio";
    }

    return nextErrors;
  };

  const handleSaveData = async (event) => {
    event.preventDefault();

    const nextErrors = validateDataForm();
    setDataErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Revise los datos del registro.");
      return;
    }

    setIsSavingData(true);

    const result = editingDataId
      ? await updateDataItem({ id: editingDataId, ...dataForm })
      : await createDataItem(dataForm);

    setIsSavingData(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setDataForm({ key: "", value: "" });
    setDataErrors({ key: "", value: "" });
    setEditingDataId(null);
  };

  const handleEditData = (record) => {
    setEditingDataId(record.id);
    setDataForm({ key: record.key, value: record.value });
    setDataErrors({ key: "", value: "" });
  };

  const handleCancelEditData = () => {
    setEditingDataId(null);
    setDataForm({ key: "", value: "" });
    setDataErrors({ key: "", value: "" });
  };

  const handleDeleteData = async (id) => {
    const result = await deleteDataItem(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    if (editingDataId === id) {
      handleCancelEditData();
    }
  };

  const handleCheckInternet = async () => {
    setIsCheckingInternet(true);
    const result = await checkInternetConnectivity();
    setIsCheckingInternet(false);
    setInternetInfo(result.snapshot);
    setLastInternetCheck(result);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(`${result.message} Latencia: ${result.latencyMs} ms.`);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <header className="h-14 border-b border-[#e1e1e1] bg-white">
        <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between px-6">
          <h1 className="text-[18px] font-semibold text-[#323130]">
            Sistema Autenticador
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="h-8 rounded-[2px] border border-[#e1e1e1] bg-white px-3 text-[13px] font-medium text-[#323130] transition hover:bg-[#f3f3f3]"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
        <section className={sectionCardClass}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-[#0078D4]">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#323130]">
                Bienvenido, {user?.name}
              </h2>
              <p className="text-[14px] text-[#605e5c]">Panel principal del sistema</p>
            </div>
          </div>

          <div className="my-6 border-t border-[#e1e1e1]" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[14px] text-[#323130]">
              <User size={16} className="text-[#605e5c]" />
              <span className="w-24 text-[#605e5c]">Nombre</span>
              <span>{user?.name}</span>
            </div>

            <div className="flex items-center gap-3 text-[14px] text-[#323130]">
              <Mail size={16} className="text-[#605e5c]" />
              <span className="w-24 text-[#605e5c]">Email</span>
              <span>{user?.email}</span>
            </div>

            <div className="flex items-center gap-3 text-[14px] text-[#323130]">
              <Shield size={16} className="text-[#107c10]" />
              <span className="w-24 text-[#605e5c]">Estado</span>
              <span className="text-[#107c10]">Sesion activa</span>
            </div>

            <div className="flex items-center gap-3 text-[14px] text-[#323130]">
              <Shield size={16} className="text-[#605e5c]" />
              <span className="w-24 text-[#605e5c]">Rol</span>
              <span className="capitalize">{user?.role ?? "user"}</span>
            </div>
          </div>
        </section>

        {isAdmin ? (
          <>
            <section className={sectionCardClass}>
              <div className="mb-4 flex items-center gap-2">
                <Layers size={16} className="text-[#0078D4]" />
                <h3 className="text-[16px] font-semibold text-[#323130]">
                  UML y modelo de 3 capas
                </h3>
              </div>

              <p className="mb-3 text-[13px] text-[#605e5c]">
                Vista renderizada del diagrama (PlantUML):
              </p>

              <div className="overflow-x-auto rounded-[2px] border border-[#e1e1e1] bg-white p-3">
                {umlImageUrl ? (
                  <img
                    src={umlImageUrl}
                    alt="Diagrama UML arquitectura en 3 capas"
                    onError={() => setUmlLoadError(true)}
                    onLoad={() => setUmlLoadError(false)}
                    className="max-w-none"
                  />
                ) : null}
              </div>

              {umlLoadError ? (
                <p className="mt-2 text-[12px] text-[#a4262c]">
                  No se pudo cargar la imagen UML remota. Revise conexion a internet.
                </p>
              ) : null}

              <details className="mt-4 rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
                <summary className="cursor-pointer text-[13px] font-medium text-[#323130]">
                  Ver codigo PlantUML
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre text-[12px] leading-5 text-[#323130]">
                  {adminUmlText}
                </pre>
              </details>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className={sectionCardClass}>
                <div className="mb-4 flex items-center gap-2">
                  <UserPlus size={16} className="text-[#0078D4]" />
                  <h3 className="text-[16px] font-semibold text-[#323130]">Gestion de usuarios</h3>
                </div>

                <form className="space-y-3" onSubmit={handleCreateUser} noValidate>
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={userForm.name}
                      onChange={(event) => {
                        setUserForm((current) => ({ ...current, name: event.target.value }));
                        setUserErrors((current) => ({ ...current, name: "" }));
                      }}
                      disabled={isSavingUser}
                      className={`${inputClass} ${
                        userErrors.name ? "border-[#a4262c]" : "border-[#e1e1e1]"
                      }`}
                    />
                    {userErrors.name && (
                      <p className="mt-1 text-[12px] text-[#a4262c]">{userErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Correo"
                      value={userForm.email}
                      onChange={(event) => {
                        setUserForm((current) => ({ ...current, email: event.target.value }));
                        setUserErrors((current) => ({ ...current, email: "" }));
                      }}
                      disabled={isSavingUser}
                      className={`${inputClass} ${
                        userErrors.email ? "border-[#a4262c]" : "border-[#e1e1e1]"
                      }`}
                    />
                    {userErrors.email && (
                      <p className="mt-1 text-[12px] text-[#a4262c]">{userErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Contrasena"
                      value={userForm.password}
                      onChange={(event) => {
                        setUserForm((current) => ({ ...current, password: event.target.value }));
                        setUserErrors((current) => ({ ...current, password: "" }));
                      }}
                      disabled={isSavingUser}
                      className={`${inputClass} ${
                        userErrors.password ? "border-[#a4262c]" : "border-[#e1e1e1]"
                      }`}
                    />
                    {userErrors.password && (
                      <p className="mt-1 text-[12px] text-[#a4262c]">{userErrors.password}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="h-10 w-full rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingUser ? "Guardando..." : "Agregar usuario"}
                  </button>
                </form>

                <div className="mt-5 border-t border-[#e1e1e1] pt-4">
                  <p className="mb-3 text-[13px] text-[#605e5c]">Usuarios registrados: {users.length}</p>

                  <div className="space-y-2">
                    {users.map((item) => {
                      const isCurrentUser = item.email === user?.email;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-[2px] border border-[#e1e1e1] bg-white p-3"
                        >
                          <div>
                            <p className="text-[14px] font-medium text-[#323130]">{item.name}</p>
                            <p className="text-[13px] text-[#605e5c]">{item.email}</p>
                            <p className="text-[12px] text-[#605e5c]">Rol: {item.role}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(item.email)}
                            disabled={isCurrentUser}
                            className="flex h-8 items-center gap-1 rounded-[2px] border border-[#e1e1e1] bg-white px-3 text-[12px] text-[#323130] transition hover:bg-[#f3f3f3] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                            {isCurrentUser ? "Activo" : "Eliminar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className={sectionCardClass}>
                <div className="mb-4 flex items-center gap-2">
                  <Database size={16} className="text-[#0078D4]" />
                  <h3 className="text-[16px] font-semibold text-[#323130]">Gestion de datos</h3>
                </div>

                <form className="space-y-3" onSubmit={handleSaveData} noValidate>
                  <div>
                    <input
                      type="text"
                      placeholder="Clave"
                      value={dataForm.key}
                      onChange={(event) => {
                        setDataForm((current) => ({ ...current, key: event.target.value }));
                        setDataErrors((current) => ({ ...current, key: "" }));
                      }}
                      disabled={isSavingData}
                      className={`${inputClass} ${
                        dataErrors.key ? "border-[#a4262c]" : "border-[#e1e1e1]"
                      }`}
                    />
                    {dataErrors.key && (
                      <p className="mt-1 text-[12px] text-[#a4262c]">{dataErrors.key}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Valor"
                      value={dataForm.value}
                      onChange={(event) => {
                        setDataForm((current) => ({ ...current, value: event.target.value }));
                        setDataErrors((current) => ({ ...current, value: "" }));
                      }}
                      disabled={isSavingData}
                      className={`${inputClass} ${
                        dataErrors.value ? "border-[#a4262c]" : "border-[#e1e1e1]"
                      }`}
                    />
                    {dataErrors.value && (
                      <p className="mt-1 text-[12px] text-[#a4262c]">{dataErrors.value}</p>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="submit"
                      disabled={isSavingData}
                      className="h-10 rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingData
                        ? "Guardando..."
                        : editingDataId
                          ? "Actualizar dato"
                          : "Agregar dato"}
                    </button>

                    {editingDataId ? (
                      <button
                        type="button"
                        onClick={handleCancelEditData}
                        className="h-10 rounded-[2px] border border-[#e1e1e1] bg-white px-4 text-[14px] font-medium text-[#323130] transition hover:bg-[#f3f3f3]"
                      >
                        Cancelar edicion
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="mt-5 border-t border-[#e1e1e1] pt-4">
                  <p className="mb-3 text-[13px] text-[#605e5c]">Registros: {dataItems.length}</p>

                  <div className="space-y-2">
                    {dataItems.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-[2px] border border-[#e1e1e1] bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[14px] font-medium text-[#323130]">{record.key}</p>
                            <p className="text-[13px] text-[#605e5c]">{record.value}</p>
                            <p className="mt-1 text-[12px] text-[#605e5c]">
                              Actualizado: {new Date(record.updatedAt).toLocaleString("es-CR")}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditData(record)}
                              className="flex h-8 items-center gap-1 rounded-[2px] border border-[#e1e1e1] bg-white px-3 text-[12px] text-[#323130] transition hover:bg-[#f3f3f3]"
                            >
                              <PencilLine size={13} />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteData(record.id)}
                              className="flex h-8 items-center gap-1 rounded-[2px] border border-[#e1e1e1] bg-white px-3 text-[12px] text-[#323130] transition hover:bg-[#f3f3f3]"
                            >
                              <Trash2 size={13} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <section className={sectionCardClass}>
              <div className="mb-4 flex items-center gap-2">
                <Globe size={16} className="text-[#0078D4]" />
                <h3 className="text-[16px] font-semibold text-[#323130]">Tecnologia de internet</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
                  <p className="mb-1 text-[12px] text-[#605e5c]">Estado</p>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-[#323130]">
                    {internetInfo.isOnline ? (
                      <Wifi size={14} className="text-[#107c10]" />
                    ) : (
                      <WifiOff size={14} className="text-[#a4262c]" />
                    )}
                    {internetInfo.isOnline ? "En linea" : "Sin conexion"}
                  </div>
                </div>

                <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
                  <p className="mb-1 text-[12px] text-[#605e5c]">Tipo de red</p>
                  <p className="text-[14px] font-medium text-[#323130]">{internetInfo.effectiveType}</p>
                </div>

                <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
                  <p className="mb-1 text-[12px] text-[#605e5c]">Downlink</p>
                  <p className="text-[14px] font-medium text-[#323130]">
                    {internetInfo.downlink ?? "No disponible"}
                    {internetInfo.downlink ? " Mbps" : ""}
                  </p>
                </div>

                <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
                  <p className="mb-1 text-[12px] text-[#605e5c]">RTT</p>
                  <p className="text-[14px] font-medium text-[#323130]">
                    {internetInfo.rtt ?? "No disponible"}
                    {internetInfo.rtt ? " ms" : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleCheckInternet}
                  disabled={isCheckingInternet}
                  className="h-10 rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCheckingInternet ? "Verificando..." : "Probar conectividad"}
                </button>

                <p className="text-[13px] text-[#605e5c]">
                  {lastInternetCheck
                    ? `Ultima verificacion: ${new Date(lastInternetCheck.checkedAt).toLocaleString("es-CR")}`
                    : "Sin verificaciones manuales"}
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className={sectionCardClass}>
            <h3 className="mb-2 text-[16px] font-semibold text-[#323130]">Dashboard de usuario</h3>
            <p className="text-[14px] text-[#605e5c]">
              Vista estandar habilitada. Esta cuenta tiene acceso de solo lectura.
            </p>
            <div className="mt-4 rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-4 text-[14px] text-[#323130]">
              No tiene permisos para ver diagramas UML, arquitectura de 3 capas o modulos de gestion.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
