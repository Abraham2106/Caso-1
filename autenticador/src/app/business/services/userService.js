import {
  createUser,
  deleteUserByEmail,
  getUserByEmail,
  getUserByUsername,
  listUsers,
} from "../../data/repositories/userRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;
const DEFAULT_MANAGED_USER_PASSWORD = "temporal123";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username ?? "",
  name: user.name,
  email: user.email,
  role: user.role ?? "user",
  createdAt: user.createdAt,
});

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function buildBaseUsername(email) {
  const localPart = email.split("@")[0] ?? "";
  const normalized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 24);

  return normalized || "usuario";
}

async function resolveAvailableUsername(baseUsername) {
  let candidate = baseUsername;
  let suffix = 1;

  while (suffix <= 1000) {
    const existing = await getUserByUsername(candidate);

    if (!existing) {
      return candidate;
    }

    candidate = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  throw new Error("No fue posible generar un nombre de usuario disponible.");
}

export async function getManagedUsers() {
  try {
    const users = await listUsers();
    return users.map(sanitizeUser);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createManagedUser({ name, email, role = "user" }) {
  await sleep(500);

  if (!name || !email) {
    return { success: false, message: "Campo obligatorio" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, message: "Correo invalido." };
  }

  try {
    const exists = await getUserByEmail(normalizedEmail);

    if (exists) {
      return {
        success: false,
        message: "Ya existe un perfil con ese correo.",
      };
    }

    const username = await resolveAvailableUsername(
      buildBaseUsername(normalizedEmail),
    );

    const created = await createUser({
      name: name.trim(),
      username,
      email: normalizedEmail,
      password: DEFAULT_MANAGED_USER_PASSWORD,
      role,
    });

    return {
      success: true,
      message: `Perfil creado correctamente. Usuario: ${username}, clave temporal: ${DEFAULT_MANAGED_USER_PASSWORD}.`,
      user: sanitizeUser(created),
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible crear el perfil."),
    };
  }
}

export async function removeManagedUser({ email, currentUserEmail }) {
  await sleep(300);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCurrent = currentUserEmail?.trim().toLowerCase();

  if (normalizedEmail === normalizedCurrent) {
    return {
      success: false,
      message: "No puede eliminar su propia sesion activa.",
    };
  }

  try {
    const removed = await deleteUserByEmail(normalizedEmail);

    if (!removed) {
      return {
        success: false,
        message: "No fue posible eliminar el perfil.",
      };
    }

    return {
      success: true,
      message: "Perfil eliminado correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible eliminar el perfil."),
    };
  }
}

