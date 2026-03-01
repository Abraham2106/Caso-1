import supabase from "../../utils/supabase";
import {
  getUserByAuthId,
  getUserByEmail,
  upsertUserProfile,
} from "../../data/repositories/userRepository";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RESET_PASSWORD_GENERIC_MESSAGE =
  "Si el correo existe, enviamos instrucciones.";

const SIGN_IN_FAILED_MESSAGE = "Credenciales invalidas. Verifique sus datos.";

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    authUserId: user.authUserId ?? null,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    createdAt: user.createdAt ?? null,
  };
}

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function resolveName({ providedName, authMetadataName, email }) {
  if (providedName?.trim()) {
    return providedName.trim();
  }

  if (authMetadataName?.trim()) {
    return authMetadataName.trim();
  }

  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "Usuario";
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

export async function syncProfileWithAuthUser(authUser, providedName) {
  const normalizedEmail = authUser?.email?.trim().toLowerCase();

  if (!authUser?.id || !normalizedEmail) {
    throw new Error("No se pudo obtener informacion de la cuenta autenticada.");
  }

  const existingByAuthId = await getUserByAuthId(authUser.id);

  if (existingByAuthId) {
    return sanitizeUser(existingByAuthId);
  }

  const existingByEmail = await getUserByEmail(normalizedEmail);

  const syncedProfile = await upsertUserProfile({
    authUserId: authUser.id,
    name: resolveName({
      providedName: existingByEmail?.name ?? providedName,
      authMetadataName: authUser.user_metadata?.name,
      email: normalizedEmail,
    }),
    email: normalizedEmail,
    role: existingByEmail?.role ?? "user",
  });

  return sanitizeUser(syncedProfile);
}

export async function getCurrentAuthenticatedUser() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`No fue posible validar la sesion: ${error.message}`);
  }

  const authUser = data.session?.user;

  if (!authUser) {
    return null;
  }

  return syncProfileWithAuthUser(authUser);
}

export function subscribeToAuthState(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    return { success: false, message: "Campo obligatorio" };
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      const emailNotConfirmed =
        error.message.includes("Email not confirmed") ||
        error.message.includes("email_not_confirmed");

      if (emailNotConfirmed) {
        return {
          success: false,
          message: "Debe verificar su correo antes de iniciar sesion.",
        };
      }

      const invalidCredentials =
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid_credentials");

      if (invalidCredentials) {
        return {
          success: false,
          message: SIGN_IN_FAILED_MESSAGE,
        };
      }

      return {
        success: false,
        message: getErrorMessage(error, "No fue posible iniciar sesion."),
      };
    }

    const profile = await syncProfileWithAuthUser(data.user);

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

export async function registerUser({ name, email, password, confirmPassword }) {
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
    const emailRedirectTo = resolveEmailVerificationRedirectUrl();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      const alreadyExists =
        error.message.includes("already registered") ||
        error.message.includes("already exists");

      if (alreadyExists) {
        return {
          success: false,
          message: "Ya existe una cuenta con ese correo.",
        };
      }

      return {
        success: false,
        message: getErrorMessage(error, "No fue posible registrar la cuenta."),
      };
    }

    const authUser = data.user;

    if (!authUser || !data.session) {
      return {
        success: true,
        message: "Cuenta creada. Revise su correo para confirmar el acceso.",
      };
    }

    const profile = await syncProfileWithAuthUser(authUser, name.trim());

    return {
      success: true,
      message: "Cuenta creada correctamente.",
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
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible cerrar sesion."),
    };
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
    await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });
  } catch (error) {
    console.error(error);
  }

  return {
    success: true,
    message: RESET_PASSWORD_GENERIC_MESSAGE,
  };
}

export async function updateCurrentUserPassword(password) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      message: getErrorMessage(
        error,
        "No fue posible actualizar la contrasena. Solicite un nuevo enlace.",
      ),
    };
  }

  return {
    success: true,
    message: "Contrasena actualizada correctamente.",
  };
}

