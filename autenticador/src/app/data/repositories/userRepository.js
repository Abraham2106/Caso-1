import supabase from "../../utils/supabase";

const USERS_TABLE = "users";

function ensureNoError(error, context) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function mapUserRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    password: record.password,
    role: record.role ?? "user",
    createdAt: record.created_at ?? record.createdAt ?? null,
  };
}

export async function listUsers() {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("id,name,email,password,role,created_at")
    .order("id", { ascending: true });

  ensureNoError(error, "Error al consultar usuarios");

  return (data ?? []).map(mapUserRecord);
}

export async function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("id,name,email,password,role,created_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  ensureNoError(error, "Error al consultar usuario por correo");

  return mapUserRecord(data);
}

export async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name,
      email: normalizedEmail,
      password,
    })
    .select("id,name,email,password,role,created_at")
    .maybeSingle();

  ensureNoError(error, "Error al crear usuario");

  return mapUserRecord(data);
}

export async function deleteUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .delete()
    .eq("email", normalizedEmail)
    .select("id");

  ensureNoError(error, "Error al eliminar usuario");

  return (data?.length ?? 0) > 0;
}
