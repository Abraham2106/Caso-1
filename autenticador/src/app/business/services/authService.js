import { createUser, getUserByEmail } from "../../data/repositories/userRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUser = (user) => ({
  name: user.name,
  email: user.email,
  role: user.role ?? "user",
});

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function loginUser({ email, password }) {
  await sleep(800);

  if (!email || !password) {
    return { success: false, message: "Campo obligatorio" };
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = await getUserByEmail(normalizedEmail);

    if (!matchedUser || matchedUser.password !== password) {
      return {
        success: false,
        message: "Credenciales invalidas. Verifique sus datos.",
      };
    }

    return {
      success: true,
      message: "Inicio de sesion exitoso.",
      user: sanitizeUser(matchedUser),
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible iniciar sesion."),
    };
  }
}

export async function registerUser({ name, email, password, confirmPassword }) {
  await sleep(800);

  if (!name || !email || !password || !confirmPassword) {
    return { success: false, message: "Campo obligatorio" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, message: "Correo invalido." };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "La contrasena debe tener al menos 6 caracteres.",
    };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Las contrasenas no coinciden." };
  }

  try {
    const exists = await getUserByEmail(normalizedEmail);

    if (exists) {
      return {
        success: false,
        message: "Ya existe una cuenta con ese correo.",
      };
    }

    const created = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return {
      success: true,
      message: "Cuenta creada correctamente.",
      user: sanitizeUser(created),
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible registrar la cuenta."),
    };
  }
}
