/**
 * Capa de Datos (Data Layer)
 * Maneja la persistencia en localStorage utilizando APIs asíncronas
 * para simular el comportamiento de una base de datos real o backend como Supabase.
 */

const DB_USERS = 'app_db_users';
const DB_RECORDS = 'app_db_records';

// Utilidad interna para simular latencia de red (50ms - 200ms)
const simulateNetwork = () => new Promise(res => setTimeout(res, Math.random() * 150 + 50));

export async function initStorage() {
  await simulateNetwork();
  if (!localStorage.getItem(DB_USERS)) {
    const seedUsers = [
      { id: 1, name: "Admin Demo", username: "demo", email: "demo@example.com", password: "123", role: "admin", createdAt: new Date().toISOString() },
      { id: 2, name: "User Demo", username: "user", email: "user@example.com", password: "123", role: "user", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(DB_USERS, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(DB_RECORDS)) {
    localStorage.setItem(DB_RECORDS, JSON.stringify([]));
  }
}

async function readTable(table) {
  await simulateNetwork();
  try {
    return JSON.parse(localStorage.getItem(table)) || [];
  } catch {
    return [];
  }
}

async function writeTable(table, data) {
  await simulateNetwork();
  localStorage.setItem(table, JSON.stringify(data));
}

function nextId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// ---- Data Methods: USERS ----

export async function fetchUsers() {
  return await readTable(DB_USERS);
}

export async function insertUser(userObj) {
  const users = await fetchUsers();
  const newUser = { ...userObj, id: nextId(users), createdAt: new Date().toISOString() };
  users.push(newUser);
  await writeTable(DB_USERS, users);
  return newUser;
}

export async function deleteUserRecord(email) {
  const users = await fetchUsers();
  const initialLength = users.length;
  const filtered = users.filter(u => u.email !== email);
  if (filtered.length !== initialLength) {
    await writeTable(DB_USERS, filtered);
    return true;
  }
  return false;
}

export async function updatePassword(email, newPassword) {
  const users = await fetchUsers();
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex > -1) {
    users[userIndex].password = newPassword;
    await writeTable(DB_USERS, users);
    return true;
  }
  return false;
}

export async function getUserByField(field, value) {
  const users = await fetchUsers();
  return users.find(u => u[field] === value) || null;
}

// ---- Data Methods: RECORDS ----

export async function fetchRecords() {
  return await readTable(DB_RECORDS);
}

export async function insertRecord(key, value) {
  const records = await fetchRecords();
  const newRecord = { id: nextId(records), key, value, updatedAt: new Date().toISOString() };
  records.push(newRecord);
  await writeTable(DB_RECORDS, records);
  return newRecord;
}

export async function editRecord(id, key, value) {
  const records = await fetchRecords();
  const idx = records.findIndex(r => r.id === parseInt(id, 10));
  if (idx > -1) {
    records[idx].key = key;
    records[idx].value = value;
    records[idx].updatedAt = new Date().toISOString();
    await writeTable(DB_RECORDS, records);
    return records[idx];
  }
  return null;
}

export async function deleteDataRecord(id) {
  const records = await fetchRecords();
  const filtered = records.filter(r => r.id !== parseInt(id, 10));
  if (filtered.length !== records.length) {
    await writeTable(DB_RECORDS, filtered);
    return true;
  }
  return false;
}
