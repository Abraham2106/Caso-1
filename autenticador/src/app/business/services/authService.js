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
const storage = typeof window !== "undefined" ? window.localStorage : null;

const getStoredUser = () => {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(SESSION_STORAGE_KEY);

  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  if (!storage) {
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

export async function getCurrentAuthenticatedUser() {
  return getStoredUser();
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
        message: "Credenciales invalidas. Verifique sus datos.",
      };
    }

    const { password: _password, ...profile } = matchedUser;
    setStoredUser(profile);

    return {
      success: true,
      message: "Inicio de sesion exitoso.",
      user: profile,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "No fue posible iniciar sesion.",
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
  const normalizedUsername = (username?.trim() || normalizedEmail.split("@")[0] || "")
    .trim()
    .toLowerCase();

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
    const publicUrl = import.meta.env.VITE_PUBLIC_URL;
    const basePath = import.meta.env.BASE_URL ?? "/";
    const baseUrl =
      publicUrl || (typeof window !== "undefined" ? window.location.origin : "");
    const emailRedirectTo = baseUrl
      ? `${baseUrl}${basePath.endsWith("/") ? basePath : `${basePath}/`}login`
      : undefined;

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
      const authMessage = authError.message ?? "";

      if (
        !authMessage.includes("already registered") &&
        !authMessage.includes("already exists")
      ) {
        message = "Cuenta creada, pero no se pudo enviar correo de confirmacion.";
      }
    } else {
      message = "Cuenta creada. Revise su correo para confirmar el acceso.";
    }

    const profile = created;
    setStoredUser(profile);

    return {
      success: true,
      message,
      user: profile,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "No fue posible registrar la cuenta.",
    };
  }
}

export async function logoutUser() {
  storage?.removeItem(SESSION_STORAGE_KEY);

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

    storage?.setItem(PASSWORD_RESET_EMAIL_KEY, normalizedEmail);

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
      message: "Si el correo existe, enviamos instrucciones.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.message ||
        "No fue posible procesar la solicitud de recuperacion.",
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
    let targetEmail = getStoredUser()?.email?.trim().toLowerCase() ?? "";

    const { data: sessionData } = await supabase.auth.getSession();
    const authEmail = sessionData.session?.user?.email?.trim().toLowerCase() ?? "";

    if (authEmail) {
      const { error: authError } = await supabase.auth.updateUser({
        password,
      });

      if (authError) {
        return {
          success: false,
          message:
            authError?.message ||
            "No fue posible actualizar la contrasena desde el enlace de correo.",
        };
      }

      targetEmail = authEmail;
    }

    if (!targetEmail) {
      targetEmail =
        storage?.getItem(PASSWORD_RESET_EMAIL_KEY)?.trim().toLowerCase() ?? "";
    }

    if (!targetEmail) {
      return {
        success: false,
        message:
          "No hay contexto para actualizar la contrasena. Solicite un nuevo enlace.",
      };
    }

    await updateUserPasswordByEmail(targetEmail, password);
    storage?.removeItem(PASSWORD_RESET_EMAIL_KEY);

    return {
      success: true,
      message: "Contrasena actualizada correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.message ||
        "No fue posible actualizar la contrasena. Solicite un nuevo enlace.",
    };
  }
}

