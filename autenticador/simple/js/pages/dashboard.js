import { getActiveSession, logout } from '../business/authService.js';
import { 
  getAllUsers, createManagedUser, removeManagedUser,
  getAllData, saveRecord, removeRecord, performHealthCheck
} from '../business/adminService.js';
import { showToast, setLoading } from '../ui/helpers.js';

let sessionUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  sessionUser = getActiveSession();
  if (!sessionUser) {
    window.location.replace('./index.html');
    return;
  }

  // Llenar vista inicial (Mi Cuenta)
  document.getElementById('v-name').textContent = sessionUser.name;
  document.getElementById('v-name-val').textContent = sessionUser.name;
  document.getElementById('v-email-val').textContent = sessionUser.email;
  document.getElementById('v-role-val').textContent = sessionUser.role;

  // Renderizar navegación condicional (Solo admin verá los botones)
  const isAdmin = sessionUser.role === 'admin';
  if (isAdmin) {
    document.getElementById('nav-users').classList.remove('hidden');
    document.getElementById('nav-data').classList.remove('hidden');
    document.getElementById('nav-health').classList.remove('hidden');
    document.getElementById('admin-info-card').classList.remove('hidden');
    initAdminListeners();
  }

  // Listener Navegación por tabs
  const navLinks = document.querySelectorAll('.nav-link');
  const tabs = document.querySelectorAll('.tab-pane');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(n => n.classList.remove('active'));
      tabs.forEach(t => t.classList.add('hidden'));
      link.classList.add('active');
      const targetId = link.getAttribute('data-target');
      document.getElementById(targetId).classList.remove('hidden');

      if (targetId === 'tab-users') renderUsers();
      if (targetId === 'tab-data') renderData();
    });
  });

  // Logout Listener
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await logout();
    window.location.replace('./index.html');
  });
});

/**
 * INIT DE VISTAS ADMIN
 * Separado para mantener limpieza de la carga inicial
 */
function initAdminListeners() {
  const formUser = document.getElementById('form-manage-user');
  formUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('mu-name').value;
    const email = document.getElementById('mu-email').value;
    setLoading('btn-mu', 'Guardando...', true);
    const res = await createManagedUser(name, email);
    setLoading('btn-mu', 'Agregar perfil', false);
    if (res.success) {
      showToast(res.message, 'success');
      formUser.reset();
      renderUsers();
    } else {
      showToast(res.message, 'error');
    }
  });

  const formData = document.getElementById('form-manage-data');
  formData.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('md-id').value;
    const key = document.getElementById('md-key').value;
    const value = document.getElementById('md-value').value;
    setLoading('btn-md', 'Guardando...', true);
    const res = await saveRecord(id, key, value);
    setLoading('btn-md', 'Guardar', false);
    
    if (res.success) {
      showToast(res.message, 'success');
      document.getElementById('btn-md-cancel').click(); // trigger reset
      renderData();
    } else { showToast(res.message, 'error'); }
  });

  document.getElementById('btn-ping').addEventListener('click', async () => {
    setLoading('btn-ping', '...', true);
    const res = await performHealthCheck();
    setLoading('btn-ping', 'Hacer Ping Storage', false);

    const stEl = document.getElementById('h-status');
    if (res.success) {
      stEl.textContent = "Operativo";
      stEl.style.color = "var(--ms-success)";
      showToast(res.message + ` (${res.latencyMs}ms)`, 'success');
    } else {
      stEl.textContent = "Falla de Sistema";
      stEl.style.color = "var(--ms-error)";
      showToast(res.detail, 'error');
    }
    document.getElementById('h-latency').textContent = res.latencyMs + ' ms';
    document.getElementById('h-time').textContent = new Date().toLocaleString();
    if(res.stats) document.getElementById('h-logs').textContent = `Metric: users(${res.stats.users}), data(${res.stats.data})`;
  });

  // Attach a window func so inline onclicks in generated HTML work (since we are module)
  window.adminDeleteUser = async (email) => {
    const res = await removeManagedUser(email, sessionUser.email);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) renderUsers();
  };

  window.adminEditData = (id, key, value) => {
    document.getElementById('md-id').value = id;
    document.getElementById('md-key').value = key;
    document.getElementById('md-value').value = value;
    document.getElementById('btn-md').textContent = 'Actualizar dato';
    document.getElementById('btn-md-cancel').classList.remove('hidden');
  };

  window.adminDeleteData = async (id) => {
    const res = await removeRecord(id);
    showToast(res.message, res.success ? 'success' : 'error');
    if (res.success) renderData();
  };
}

async function renderUsers() {
  const users = await getAllUsers();
  let html = '';
  users.forEach(u => {
    const isMe = u.email === sessionUser.email;
    html += `
      <div class="list-item">
        <div>
          <h4>${u.name}</h4>
          <p>Usuario: ${u.username} <br> Email: ${u.email} <br> Rol: ${u.role}</p>
        </div>
        <button class="btn btn-secondary" style="width: auto" ${isMe ? 'disabled' : ''} onclick="window.adminDeleteUser('${u.email}')">
          ${isMe ? 'Activo' : 'Eliminar'}
        </button>
      </div>`;
  });
  document.getElementById('list-users').innerHTML = html;
}

async function renderData() {
  const records = await getAllData();
  let html = '';
  records.forEach(r => {
    html += `
      <div class="list-item">
        <div>
          <h4>${r.key}</h4>
          <p>${r.value} <br> <span style="font-size: 11px;">Act: ${new Date(r.updatedAt).toLocaleString()}</span></p>
        </div>
        <div style="display:flex; gap: 8px;">
          <button class="btn btn-secondary" style="width: auto; height: 32px; padding: 0 12px; font-size:13px;" onclick="window.adminEditData(${r.id}, '${r.key}', '${r.value}')">Editar</button>
          <button class="btn btn-secondary" style="width: auto; height: 32px; padding: 0 12px; font-size:13px;" onclick="window.adminDeleteData(${r.id})">Del</button>
        </div>
      </div>`;
  });
  document.getElementById('list-data').innerHTML = html;
}
