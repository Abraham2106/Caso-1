import { ChevronRight } from "lucide-react";
import { sectionCardClass } from "./dashboardStyles";

function DashboardSidebar({ user, navItems, activeSection, onSelect }) {
  const initials = (user?.name ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="space-y-4">
      <section className={sectionCardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d2b9a6] text-[22px] font-semibold text-[#323130]">
            {initials}
          </div>
          <div>
            <p className="text-[22px] font-semibold leading-none text-[#323130]">{user?.name}</p>
            <p className="mt-1 text-[14px] text-[#605e5c]">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <h2 className="mb-3 text-[14px] font-semibold text-[#323130]">Navegacion</h2>
        <div className="space-y-1">
          {navItems.map((item) => {
            const ItemIcon = item.icon;
            const active = item.id === activeSection;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
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
  );
}

export default DashboardSidebar;
