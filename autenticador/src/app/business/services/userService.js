import {
  createUser,
  deleteUserByEmail,
  getUserByEmail,
  getUserByUsername,
  listUsers,
} from "../../data/repositories/userRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;
const DEFAULT_MANAGED_USER_PASSWORD = "temporal123";

async function resolveUsername(email) {
  const base =
    (email.split("@")[0] ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24) || "usuario";

  let candidate = base;

  for (let index = 1; index <= 1000; index += 1) {
    const existing = await getUserByUsername(candidate);

    if (!existing) {
      return candidate;
    }

    candidate = `${base}${index}`;
  }

  throw new Error("No fue posible generar un nombre de usuario disponible.");
}

export async function getManagedUsers() {
  try {
    return await listUsers();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createManagedUser({ name, email, role = "user" }) {
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

    const username = await resolveUsername(normalizedEmail);

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
      user: created,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "No fue posible crear el perfil.",
    };
  }
}

export async function removeManagedUser({ email, currentUserEmail }) {
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
      message: error?.message || "No fue posible eliminar el perfil.",
    };
  }
}
