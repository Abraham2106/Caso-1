import { useState } from "react";
import { Stethoscope, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkSystemHealth } from "../business/services/internetService";
import { useAuth } from "../contexts/AuthContext";
import AccountSection from "../components/dashboard/AccountSection";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import UsersSection from "../components/dashboard/UsersSection";
import HealthSection from "../components/dashboard/HealthSection";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    users,
    logout,
    createUserAccount,
    deleteUserAccount,
  } = useAuth();

  const isAdmin = user?.role === "admin";

  const navItems = [
    { id: "account", label: "Mi cuenta", icon: User },
    ...(isAdmin
      ? [
          { id: "users", label: "Gestion de usuarios", icon: UserPlus },
          { id: "health", label: "Salud del sistema", icon: Stethoscope },
        ]
      : []),
  ];

  const [activeSection, setActiveSection] = useState("account");
  const effectiveSection = navItems.some((item) => item.id === activeSection)
    ? activeSection
    : "account";

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
  });
  const [userErrors, setUserErrors] = useState({
    name: "",
    email: "",
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState(null);

  const handleLogout = async () => {
    const result = await logout();

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    navigate("/login", { replace: true });
  };

  const handleUserChange = (field, value) => {
    setUserForm((current) => ({ ...current, [field]: value }));
    setUserErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    const nextErrors = { name: "", email: "" };
    const nameValue = userForm.name.trim();
    const emailValue = userForm.email.trim();

    if (!nameValue) {
      nextErrors.name = "Campo obligatorio";
    }

    if (!emailValue) {
      nextErrors.email = "Campo obligatorio";
    } else if (!EMAIL_REGEX.test(emailValue)) {
      nextErrors.email = "Correo invalido";
    }

    setUserErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Revise los datos del usuario.");
      return;
    }

    setIsSavingUser(true);
    const result = await createUserAccount({ name: nameValue, email: emailValue });
    setIsSavingUser(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setUserForm({ name: "", email: "" });
    setUserErrors({ name: "", email: "" });
  };

  const handleDeleteUser = async (email) => {
    const result = await deleteUserAccount(email);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
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

  let activeView = <AccountSection user={user} isAdmin={isAdmin} />;

  if (effectiveSection === "users" && isAdmin) {
    activeView = (
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
  } else if (effectiveSection === "health" && isAdmin) {
    activeView = (
      <HealthSection
        healthResult={healthResult}
        isCheckingHealth={isCheckingHealth}
        onCheckHealth={handleCheckHealth}
      />
    );
  }

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
          <section>{activeView}</section>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;

