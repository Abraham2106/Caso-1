import { Trash2, UserPlus } from "lucide-react";
import { inputClass, sectionCardClass } from "./dashboardStyles";

function UsersSection({
  user,
  users,
  userForm,
  userErrors,
  isSavingUser,
  onUserChange,
  onCreateUser,
  onDeleteUser,
}) {
  return (
    <section className={sectionCardClass}>
      <div className="mb-4 flex items-center gap-2">
        <UserPlus size={16} className="text-[#0078D4]" />
        <h3 className="text-[16px] font-semibold text-[#323130]">Gestion de usuarios</h3>
      </div>

      <form className="space-y-3" onSubmit={onCreateUser} noValidate>
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={userForm.name}
            onChange={(event) => onUserChange("name", event.target.value)}
            disabled={isSavingUser}
            className={`${inputClass} ${
              userErrors.name ? "border-[#a4262c]" : "border-[#e1e1e1]"
            }`}
          />
          {userErrors.name ? (
            <p className="mt-1 text-[12px] text-[#a4262c]">{userErrors.name}</p>
          ) : null}
        </div>

        <div>
          <input
            type="email"
            placeholder="Correo"
            value={userForm.email}
            onChange={(event) => onUserChange("email", event.target.value)}
            disabled={isSavingUser}
            className={`${inputClass} ${
              userErrors.email ? "border-[#a4262c]" : "border-[#e1e1e1]"
            }`}
          />
          {userErrors.email ? (
            <p className="mt-1 text-[12px] text-[#a4262c]">{userErrors.email}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSavingUser}
          className="h-10 w-full rounded-[2px] bg-[#0078D4] px-4 text-[14px] font-medium text-white transition hover:bg-[#106ebe] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSavingUser ? "Guardando..." : "Agregar perfil"}
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
                  onClick={() => onDeleteUser(item.email)}
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
}

export default UsersSection;
