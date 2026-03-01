import supabase from "../../utils/supabase";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  updateUserPasswordByEmail,
} from "../../data/repositories/userRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;
const SESSION_STORAGE_KEY = "app_auth_user";
const PASSWORD_RESET_EMAIL_KEY = "app_password_reset_email";

export const RESET_PASSWORD_GENERIC_MESSAGE =
  "Si el correo existe, enviamos instrucciones.";

const SIGN_IN_FAILED_MESSAGE = "Credenciales invalidas. Verifique sus datos.";

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    createdAt: user.createdAt ?? null,
  };
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function persistSessionUser(user) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function clearSessionUser() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(SESSION_STORAGE_KEY);
}

function readSessionUser() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const raw = storage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistPasswordResetEmail(email) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(PASSWORD_RESET_EMAIL_KEY, email);
}

function readPasswordResetEmail() {
  const storage = getStorage();

  if (!storage) {
    return "";
  }

  return storage.getItem(PASSWORD_RESET_EMAIL_KEY) ?? "";
}

function clearPasswordResetEmail() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(PASSWORD_RESET_EMAIL_KEY);
}

function resolveEmailVerificationRedirectUrl() {
  const publicUrl = import.meta.env.VITE_PUBLIC_URL;
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const fallbackBaseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = publicUrl || fallbackBaseUrl;

  if (!baseUrl) {
    return undefined;
  }

  return `${baseUrl}${normalizedBase}login`;
}

function resolveUsername({ providedUsername, email }) {
  if (providedUsername?.trim()) {
    return providedUsername.trim().toLowerCase();
  }

  if (!email.includes("@")) {
    return "";
  }

  return email.split("@")[0].trim().toLowerCase();
}

function isAuthAlreadyRegisteredError(error) {
  const message = error?.message ?? "";

  return (
    message.includes("already registered") || message.includes("already exists")
  );
}

export async function syncProfileWithAuthUser(authUser) {
  const normalizedEmail = authUser?.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("No se pudo obtener informacion de la cuenta.");
  }

  const existing = await getUserByEmail(normalizedEmail);

  if (!existing) {
    throw new Error("No existe perfil para el correo autenticado.");
  }

  const profile = sanitizeUser(existing);
  persistSessionUser(profile);
  return profile;
}

export async function getCurrentAuthenticatedUser() {
  return readSessionUser();
}

export function subscribeToAuthState() {
  return () => {};
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    return { success: false, message: "Campo obligatorio" };
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = await getUserByEmail(normalizedEmail, {
      withPassword: true,
    });

    if (!matchedUser || matchedUser.password !== password) {
      return {
        success: false,
        message: SIGN_IN_FAILED_MESSAGE,
      };
    }

    const profile = sanitizeUser(matchedUser);
    persistSessionUser(profile);

    return {
      success: true,
      message: "Inicio de sesion exitoso.",
      user: profile,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible iniciar sesion."),
    };
  }
}

export async function registerUser({
  name,
  username,
  email,
  password,
  confirmPassword,
}) {
  if (!name || !email || !password || !confirmPassword) {
    return { success: false, message: "Campo obligatorio" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = resolveUsername({
    providedUsername: username,
    email: normalizedEmail,
  });

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, message: "Correo invalido." };
  }

  if (!USERNAME_REGEX.test(normalizedUsername)) {
    return {
      success: false,
      message:
        "Usuario invalido. Use 3-30 caracteres: letras, numeros, punto, guion o guion bajo.",
    };
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
    const existingByEmail = await getUserByEmail(normalizedEmail);

    if (existingByEmail) {
      return {
        success: false,
        message: "Ya existe una cuenta con ese correo.",
      };
    }

    const existingByUsername = await getUserByUsername(normalizedUsername);

    if (existingByUsername) {
      return {
        success: false,
        message: "Ya existe una cuenta con ese nombre de usuario.",
      };
    }

    const created = await createUser({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role: "user",
    });

    let message = "Cuenta creada correctamente.";
    const emailRedirectTo = resolveEmailVerificationRedirectUrl();

    const { error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          name: name.trim(),
        },
      },
    });

    if (authError) {
      if (!isAuthAlreadyRegisteredError(authError)) {
        message =
          "Cuenta creada, pero no se pudo enviar correo de confirmacion.";
      }
    } else {
      message = "Cuenta creada. Revise su correo para confirmar el acceso.";
    }

    const profile = sanitizeUser(created);
    persistSessionUser(profile);

    return {
      success: true,
      message,
      user: profile,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible registrar la cuenta."),
    };
  }
}

export async function logoutUser() {
  clearSessionUser();

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error(error);
  }

  return {
    success: true,
    message: "Sesion cerrada correctamente.",
  };
}

export async function sendPasswordResetEmail({ email, redirectTo }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      success: false,
      message: "Correo invalido",
    };
  }

  try {
    const existingByEmail = await getUserByEmail(normalizedEmail);

    if (!existingByEmail) {
      return {
        success: false,
        message: "No existe una cuenta con ese correo.",
      };
    }

    persistPasswordResetEmail(normalizedEmail);

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo,
      },
    );

    if (error) {
      console.error(error);
    }

    return {
      success: true,
      message: RESET_PASSWORD_GENERIC_MESSAGE,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "No fue posible procesar la solicitud de recuperacion.",
      ),
    };
  }
}

export async function updateCurrentUserPassword(password) {
  if (!password || password.length < 6) {
    return {
      success: false,
      message: "La contrasena debe tener al menos 6 caracteres.",
    };
  }

  try {
    let targetEmail = readSessionUser()?.email?.trim().toLowerCase() ?? "";

    const { data: sessionData } = await supabase.auth.getSession();
    const authEmail = sessionData.session?.user?.email?.trim().toLowerCase() ?? "";

    if (authEmail) {
      const { error: authError } = await supabase.auth.updateUser({
        password,
      });

      if (authError) {
        return {
          success: false,
          message: getErrorMessage(
            authError,
            "No fue posible actualizar la contrasena desde el enlace de correo.",
          ),
        };
      }

      targetEmail = authEmail;
    }

    if (!targetEmail) {
      targetEmail = readPasswordResetEmail().trim().toLowerCase();
    }

    if (!targetEmail) {
      return {
        success: false,
        message:
          "No hay contexto para actualizar la contrasena. Solicite un nuevo enlace.",
      };
    }

    await updateUserPasswordByEmail(targetEmail, password);
    clearPasswordResetEmail();

    return {
      success: true,
      message: "Contrasena actualizada correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "No fue posible actualizar la contrasena. Solicite un nuevo enlace.",
      ),
    };
  }
}

