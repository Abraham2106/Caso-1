import { 
  fetchUsers, insertUser, deleteUserRecord, getUserByField,
  fetchRecords, insertRecord, editRecord, deleteDataRecord 
} from '../data/store.js';



export async function getAllUsers() {
  const users = await fetchUsers();
  
  return users.map(({ password, ...safeData }) => safeData);
}

export async function createManagedUser(name, email) {
  const exists = await getUserByField('email', email.toLowerCase());
  if (exists) return { success: false, message: "El correo ya está en uso." };
  
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;

  const created = await insertUser({
    name, email: email.toLowerCase(), username, password: 'temporal123', role: 'user'
  });

  return { success: true, message: `Usuario creado. Contraseña temporal: temporal123` };
}

export async function removeManagedUser(email, adminEmail) {
  if (email === adminEmail) {
    return { success: false, message: "No puedes eliminar tu propia cuenta." };
  }
  const deleted = await deleteUserRecord(email);
  return deleted ? { success: true, message: "Usuario eliminado" } : { success: false, message: "Hubo un error del sistema." };
}



export async function getAllData() {
  return await fetchRecords();
}

export async function saveRecord(id, key, value) {
  if (id) {
    const res = await editRecord(id, key, value);
    return res ? { success: true, message: "Dato actualizado." } : { success: false, message: "No se encontro el dato." };
  } else {
    await insertRecord(key, value);
    return { success: true, message: "Dato registrado." };
  }
}

export async function removeRecord(id) {
  const res = await deleteDataRecord(id);
  return res ? { success: true, message: "Registro eliminado." } : { success: false, message: "No se pudo borrar." };
}



export async function performHealthCheck() {
  const start = Date.now();
  let detail = null;
  let stats = { users: 0, data: 0 };

  try {
    const users = await fetchUsers();
    const data = await fetchRecords();
    stats.users = users.length;
    stats.data = data.length;
  } catch (error) {
    detail = error.message;
  }

  const latencyMs = Date.now() - start;

  if (detail) {
    return { success: false, latencyMs, message: "Fallo de conexión al Storage", detail };
  }

  return { success: true, latencyMs, message: "Database Operational", stats };
}
