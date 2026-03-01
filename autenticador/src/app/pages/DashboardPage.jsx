import { useMemo, useState } from "react";
import {
  ChevronRight,
  Database,
  Layers,
  Mail,
  PencilLine,
  Shield,
  Stethoscope,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkSystemHealth } from "../business/services/internetService";
import { useAuth } from "../contexts/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-10 w-full rounded-[2px] border border-[#e1e1e1] px-3 text-[14px] text-[#323130] outline-none transition focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] disabled:bg-[#f3f3f3]";

const sectionCardClass = "rounded-[2px] border border-[#e1e1e1] bg-white p-6";

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

  const navItems = useMemo(() => {
    const base = [
      {
        id: "account",
        label: "Mi cuenta",
        icon: User,
      },
    ];

    if (isAdmin) {
      return [
        ...base,
        {
          id: "users",
          label: "Gestion de usuarios",
          icon: UserPlus,
        },
        {
          id: "data",
          label: "Gestion de datos",
          icon: Database,
        },
        {
          id: "health",
          label: "Salud del sistema",
          icon: Stethoscope,
        },
      ];
    }

    return base;
  }, [isAdmin]);

  const [activeSection, setActiveSection] = useState("account");
  const effectiveSection = navItems.some((item) => item.id === activeSection)
    ? activeSection
    : "account";

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

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState(null);

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
    setActiveSection("data");
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

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    const result = await checkSystemHealth();
    setIsCheckingHealth(false);
    setHealthResult(result);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(`${result.message} Latencia: ${result.latencyMs} ms.`);
  };

  const renderAccountSection = () => (
    <div className="space-y-6">
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
        <section className={sectionCardClass}>
          <div className="mb-4 flex items-center gap-2">
            <Layers size={16} className="text-[#0078D4]" />
            <h3 className="text-[16px] font-semibold text-[#323130]">
              Arquitectura en 3 capas
            </h3>
          </div>

          <div className="space-y-3 text-[14px] text-[#323130]">
            <p>
              El sistema se organiza en <strong>Presentacion</strong>, <strong>Negocio</strong> y <strong>Datos</strong>.
              Esta division separa responsabilidades y reduce acoplamiento entre interfaz, reglas y persistencia.
            </p>

            <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
              <p className="font-medium text-[#323130]">Proposito</p>
              <p className="mt-1 text-[13px] text-[#605e5c]">
                Facilitar mantenimiento, pruebas y escalabilidad sin mezclar logica de UI con acceso a base de datos.
              </p>
            </div>

            <div className="rounded-[2px] border border-[#e1e1e1] bg-[#f3f3f3] p-3">
              <p className="font-medium text-[#323130]">Eleccion</p>
              <p className="mt-1 text-[13px] text-[#605e5c]">
                Se eligio este modelo para permitir evolucion independiente de React (presentacion), servicios (negocio)
                y repositorios con Supabase (datos).
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );

  const renderUsersSection = () => (
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
  );

  const renderDataSection = () => (
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
  );

  const renderHealthSection = () => (
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
          onClick={handleCheckHealth}
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

  const renderActiveSection = () => {
    if (effectiveSection === "users" && isAdmin) {
      return renderUsersSection();
    }

    if (effectiveSection === "data" && isAdmin) {
      return renderDataSection();
    }

    if (effectiveSection === "health" && isAdmin) {
      return renderHealthSection();
    }

    return renderAccountSection();
  };

  const initials = (user?.name ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <header className="h-14 border-b border-[#e1e1e1] bg-white">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
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

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <section className={sectionCardClass}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d2b9a6] text-[22px] font-semibold text-[#323130]">
                  {initials}
                </div>
                <div>
                  <p className="text-[22px] font-semibold leading-none text-[#323130]">
                    {user?.name}
                  </p>
                  <p className="mt-1 text-[14px] text-[#605e5c]">{user?.email}</p>
                </div>
              </div>
            </section>

            <section className={sectionCardClass}>
              <h2 className="mb-3 text-[14px] font-semibold text-[#323130]">Navegacion</h2>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const ItemIcon = item.icon;
                  const active = item.id === effectiveSection;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center justify-between rounded-[2px] border px-3 py-2 text-left text-[14px] transition ${
                        active
                          ? "border-[#0078D4] bg-[#eef6fc] text-[#323130]"
                          : "border-[#e1e1e1] bg-white text-[#323130] hover:bg-[#f3f3f3]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ItemIcon size={15} className="text-[#605e5c]" />
                        {item.label}
                      </span>
                      <ChevronRight size={14} className="text-[#605e5c]" />
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <section>{renderActiveSection()}</section>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;





