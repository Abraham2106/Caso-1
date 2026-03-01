import { Database, PencilLine, Trash2 } from "lucide-react";
import { inputClass, sectionCardClass } from "./dashboardStyles";

function DataSection({
  dataItems,
  dataForm,
  dataErrors,
  editingDataId,
  isSavingData,
  onDataChange,
  onSaveData,
  onCancelEditData,
  onEditData,
  onDeleteData,
}) {
  return (
    <section className={sectionCardClass}>
      <div className="mb-4 flex items-center gap-2">
        <Database size={16} className="text-[#0078D4]" />
        <h3 className="text-[16px] font-semibold text-[#323130]">Gestion de datos</h3>
      </div>

      <form className="space-y-3" onSubmit={onSaveData} noValidate>
        <div>
          <input
            type="text"
            placeholder="Clave"
            value={dataForm.key}
            onChange={(event) => onDataChange("key", event.target.value)}
            disabled={isSavingData}
            className={`${inputClass} ${
              dataErrors.key ? "border-[#a4262c]" : "border-[#e1e1e1]"
            }`}
          />
          {dataErrors.key ? (
            <p className="mt-1 text-[12px] text-[#a4262c]">{dataErrors.key}</p>
          ) : null}
        </div>

        <div>
          <input
            type="text"
            placeholder="Valor"
            value={dataForm.value}
            onChange={(event) => onDataChange("value", event.target.value)}
            disabled={isSavingData}
            className={`${inputClass} ${
              dataErrors.value ? "border-[#a4262c]" : "border-[#e1e1e1]"
            }`}
          />
          {dataErrors.value ? (
            <p className="mt-1 text-[12px] text-[#a4262c]">{dataErrors.value}</p>
          ) : null}
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
              onClick={onCancelEditData}
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
                    onClick={() => onEditData(record)}
                    className="flex h-8 items-center gap-1 rounded-[2px] border border-[#e1e1e1] bg-white px-3 text-[12px] text-[#323130] transition hover:bg-[#f3f3f3]"
                  >
                    <PencilLine size={13} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteData(record.id)}
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
}

export default DataSection;
