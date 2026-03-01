import {
  createUser,
  deleteUserByEmail,
  getUserByEmail,
  listUsers,
} from "../../data/repositories/userRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUser = (user) => ({
  id: user.id,
  authUserId: user.authUserId ?? null,
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

    const created = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      role,
      authUserId: null,
    });

    return {
      success: true,
      message: "Perfil creado correctamente.",
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

