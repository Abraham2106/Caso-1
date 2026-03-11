import supabase from "../../utils/supabase";

const DATA_TABLE = "data_records";
const DATA_SELECT = "id,key,value,updated_at";

const mapRecord = (record) =>
  record
    ? {
        id: record.id,
        key: record.key,
        value: record.value,
        updatedAt: record.updated_at ?? record.updatedAt ?? null,
      }
    : null;

export async function listDataRecords() {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .select(DATA_SELECT)
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Error al consultar datos: ${error.message}`);
  }

  return (data ?? []).map(mapRecord);
}

export async function createDataRecord({ key, value }) {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .insert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })
    .select(DATA_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al crear dato: ${error.message}`);
  }

  return mapRecord(data);
}

export async function updateDataRecord({ id, key, value }) {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .update({
      key,
      value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(DATA_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al actualizar dato: ${error.message}`);
  }

  return mapRecord(data);
}

export async function deleteDataRecord(id) {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new Error(`Error al eliminar dato: ${error.message}`);
  }

  return (data?.length ?? 0) > 0;
}
