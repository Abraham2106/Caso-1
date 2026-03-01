import { Layers, Mail, Shield, User } from "lucide-react";
import { sectionCardClass } from "./dashboardStyles";

function AccountSection({ user, isAdmin }) {
  return (
    <div className="space-y-6">
      <section className={sectionCardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-[#0078D4]">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#323130]">Bienvenido, {user?.name}</h2>
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
            <h3 className="text-[16px] font-semibold text-[#323130]">Arquitectura en 3 capas</h3>
          </div>

          <div className="space-y-3 text-[14px] text-[#323130]">
            <p>
              El sistema se organiza en <strong>Presentacion</strong>, <strong>Negocio</strong> y <strong>Datos</strong>. Esta division separa responsabilidades y reduce acoplamiento entre interfaz, reglas y persistencia.
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
                Se eligio este modelo para permitir evolucion independiente de React (presentacion), servicios (negocio) y repositorios con Supabase (datos).
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AccountSection;
