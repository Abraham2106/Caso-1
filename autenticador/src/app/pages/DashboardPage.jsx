import { useMemo, useState } from "react";
import { Database, Stethoscope, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkSystemHealth } from "../business/services/internetService";
import { useAuth } from "../contexts/AuthContext";
import AccountSection from "../components/dashboard/AccountSection";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import UsersSection from "../components/dashboard/UsersSection";
import DataSection from "../components/dashboard/DataSection";
import HealthSection from "../components/dashboard/HealthSection";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const baseItems = [{ id: "account", label: "Mi cuenta", icon: User }];

    if (!isAdmin) {
      return baseItems;
    }

    return [
      ...baseItems,
      { id: "users", label: "Gestion de usuarios", icon: UserPlus },
      { id: "data", label: "Gestion de datos", icon: Database },
      { id: "health", label: "Salud del sistema", icon: Stethoscope },
    ];
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

  const handleUserChange = (field, value) => {
    setUserForm((current) => ({ ...current, [field]: value }));
    setUserErrors((current) => ({ ...current, [field]: "" }));
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

  const handleDataChange = (field, value) => {
    setDataForm((current) => ({ ...current, [field]: value }));
    setDataErrors((current) => ({ ...current, [field]: "" }));
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

  const renderActiveSection = () => {
    if (effectiveSection === "users" && isAdmin) {
      return (
        <UsersSection
          user={user}
          users={users}
          userForm={userForm}
          userErrors={userErrors}
          isSavingUser={isSavingUser}
          onUserChange={handleUserChange}
          onCreateUser={handleCreateUser}
          onDeleteUser={handleDeleteUser}
        />
      );
    }

    if (effectiveSection === "data" && isAdmin) {
      return (
        <DataSection
          dataItems={dataItems}
          dataForm={dataForm}
          dataErrors={dataErrors}
          editingDataId={editingDataId}
          isSavingData={isSavingData}
          onDataChange={handleDataChange}
          onSaveData={handleSaveData}
          onCancelEditData={handleCancelEditData}
          onEditData={handleEditData}
          onDeleteData={handleDeleteData}
        />
      );
    }

    if (effectiveSection === "health" && isAdmin) {
      return (
        <HealthSection
          healthResult={healthResult}
          isCheckingHealth={isCheckingHealth}
          onCheckHealth={handleCheckHealth}
        />
      );
    }

    return <AccountSection user={user} isAdmin={isAdmin} />;
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <header className="h-14 border-b border-[#e1e1e1] bg-white">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6">
          <h1 className="text-[18px] font-semibold text-[#323130]">Sistema Autenticador</h1>
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
          <DashboardSidebar
            user={user}
            navItems={navItems}
            activeSection={effectiveSection}
            onSelect={setActiveSection}
          />
          <section>{renderActiveSection()}</section>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
