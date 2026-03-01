import supabase from "../../utils/supabase";

const DATA_TABLE = "data_records";

function ensureNoError(error, context) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function mapDataRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    key: record.key,
    value: record.value,
    updatedAt: record.updated_at ?? record.updatedAt ?? null,
  };
}

export async function listDataRecords() {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .select("id,key,value,updated_at")
    .order("id", { ascending: true });

  ensureNoError(error, "Error al consultar datos");

  return (data ?? []).map(mapDataRecord);
}

export async function createDataRecord({ key, value }) {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .insert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })
    .select("id,key,value,updated_at")
    .maybeSingle();

  ensureNoError(error, "Error al crear dato");

  return mapDataRecord(data);
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
    .select("id,key,value,updated_at")
    .maybeSingle();

  ensureNoError(error, "Error al actualizar dato");

  return mapDataRecord(data);
}

export async function deleteDataRecord(id) {
  const { data, error } = await supabase
    .from(DATA_TABLE)
    .delete()
    .eq("id", id)
    .select("id");

  ensureNoError(error, "Error al eliminar dato");

  return (data?.length ?? 0) > 0;
}
