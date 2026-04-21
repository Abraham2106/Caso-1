import { getUserByField, insertUser, updatePassword } from '../data/store.js';

const SESSION_KEY = "auth_current_session";
const RECOVERY_KEY = "auth_recovery_email";

export function getActiveSession() {
  const data = sessionStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export async function login(email, password) {
  const user = await getUserByField("email", email.toLowerCase());
  if (!user || user.password !== password) {
    return { success: false, message: "Credenciales inválidas. Verifique sus datos." };
  }
  
  const { password: _, ...safeUser } = user;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return { success: true, message: "Inicio de sesión exitoso.", user: safeUser };
}

export async function register(userData) {
  const email = userData.email.toLowerCase();
  const username = userData.username.toLowerCase();

  const [existingEmail, existingUsername] = await Promise.all([
    getUserByField("email", email),
    getUserByField("username", username)
  ]);

  if (existingEmail) return { success: false, message: "Ya existe una cuenta con este correo." };
  if (existingUsername) return { success: false, message: "El nombre de usuario no está disponible." };

  const newUser = await insertUser({
    name: userData.name,
    email,
    username,
    password: userData.password,
    role: "user" 
  });

  const { password: _, ...safeUser } = newUser;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return { success: true, message: "Cuenta registrada con éxito" };
}

export async function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  return { success: true };
}

export async function startPasswordRecovery(email) {
  const user = await getUserByField("email", email.toLowerCase());
  if (!user) {
    return { success: false, message: "No existe una cuenta con ese correo." };
  }
  sessionStorage.setItem(RECOVERY_KEY, email.toLowerCase());
  return { success: true, message: "Proceso de recuperación validado." };
}

export async function finishPasswordRecovery(newPassword) {
  const emailTarget = sessionStorage.getItem(RECOVERY_KEY);
  if (!emailTarget) {
    return { success: false, message: "Sesión de recuperación inválida o expirada." };
  }

  const success = await updatePassword(emailTarget, newPassword);
  if (success) {
    sessionStorage.removeItem(RECOVERY_KEY);
    return { success: true, message: "Contraseña actualizada exitosamente." };
  }
  return { success: false, message: "Ocurrió un error en la base de datos." };
}
