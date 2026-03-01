import supabase from "../../utils/supabase";

const USERS_TABLE = "users";
const USER_SELECT_SAFE = "id,username,name,email,role,created_at";
const USER_SELECT_WITH_PASSWORD = "id,username,name,email,password,role,created_at";

function ensureNoError(error, context) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function mapUserRecord(record, includePassword = false) {
  if (!record) {
    return null;
  }

  const baseUser = {
    id: record.id,
    username: record.username,
    name: record.name,
    email: record.email,
    role: record.role ?? "user",
    createdAt: record.created_at ?? record.createdAt ?? null,
  };

  if (!includePassword) {
    return baseUser;
  }

  return {
    ...baseUser,
    password: record.password,
  };
}

export async function listUsers() {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(USER_SELECT_SAFE)
    .order("id", { ascending: true });

  ensureNoError(error, "Error al consultar usuarios");

  return (data ?? []).map((record) => mapUserRecord(record));
}

export async function getUserByEmail(email, options = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  const includePassword = options.withPassword ?? false;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(includePassword ? USER_SELECT_WITH_PASSWORD : USER_SELECT_SAFE)
    .eq("email", normalizedEmail)
    .maybeSingle();

  ensureNoError(error, "Error al consultar usuario por correo");

  return mapUserRecord(data, includePassword);
}

export async function getUserByUsername(username, options = {}) {
  const normalizedUsername = username.trim().toLowerCase();
  const includePassword = options.withPassword ?? false;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(includePassword ? USER_SELECT_WITH_PASSWORD : USER_SELECT_SAFE)
    .eq("username", normalizedUsername)
    .maybeSingle();

  ensureNoError(error, "Error al consultar usuario por nombre de usuario");

  return mapUserRecord(data, includePassword);
}

export async function createUser({
  name,
  username,
  email,
  password,
  role = "user",
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role,
    })
    .select(USER_SELECT_SAFE)
    .maybeSingle();

  ensureNoError(error, "Error al crear usuario");

  return mapUserRecord(data);
}

export async function updateUserPasswordByEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      password,
    })
    .eq("email", normalizedEmail)
    .select(USER_SELECT_SAFE)
    .maybeSingle();

  ensureNoError(error, "Error al actualizar contrasena");

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
