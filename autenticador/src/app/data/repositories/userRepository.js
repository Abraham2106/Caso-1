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
    authUserId: record.auth_user_id ?? null,
    name: record.name,
    email: record.email,
    role: record.role ?? "user",
    createdAt: record.created_at ?? record.createdAt ?? null,
  };
}

export async function listUsers() {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("id,auth_user_id,name,email,role,created_at")
    .order("id", { ascending: true });

  ensureNoError(error, "Error al consultar usuarios");

  return (data ?? []).map(mapUserRecord);
}

export async function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("id,auth_user_id,name,email,role,created_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  ensureNoError(error, "Error al consultar usuario por correo");

  return mapUserRecord(data);
}

export async function getUserByAuthId(authUserId) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select("id,auth_user_id,name,email,role,created_at")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  ensureNoError(error, "Error al consultar usuario por auth id");

  return mapUserRecord(data);
}

export async function createUser({ name, email, role = "user", authUserId = null }) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name,
      email: normalizedEmail,
      role,
      auth_user_id: authUserId,
    })
    .select("id,auth_user_id,name,email,role,created_at")
    .maybeSingle();

  ensureNoError(error, "Error al crear usuario");

  return mapUserRecord(data);
}

export async function upsertUserProfile({ authUserId, name, email, role = "user" }) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .upsert(
      {
        auth_user_id: authUserId,
        name,
        email: normalizedEmail,
        role,
      },
      {
        onConflict: "email",
      },
    )
    .select("id,auth_user_id,name,email,role,created_at")
    .maybeSingle();

  ensureNoError(error, "Error al sincronizar perfil de usuario");

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

