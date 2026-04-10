import { initStorage } from '../data/store.js';
import { login, getActiveSession } from '../business/authService.js';
import { showToast, clearErrors, setFieldError, setLoading } from '../ui/helpers.js';
import { validateEmail, validateRequired, runValidations } from '../ui/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initStorage();
  
  if (getActiveSession()) {
    window.location.replace('./dashboard.html');
    return;
  }

  const form = document.getElementById('login-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = ['login-email', 'login-password'];
    clearErrors(fields);

    const hasErrors = runValidations({
      'login-email': validateEmail,
      'login-password': validateRequired
    }, setFieldError);

    if (hasErrors) {
      showToast('Verifique los campos marcados', 'error');
      return;
    }

    setLoading('btn-submit', 'Iniciando sesión...', true);
    
    const email = document.getElementById('login-email').value;
    const pwd = document.getElementById('login-password').value;
    
    const response = await login(email, pwd);
    
    setLoading('btn-submit', 'Iniciar sesión', false);

    if (response.success) {
      showToast(response.message, 'success');
      setTimeout(() => window.location.replace('./dashboard.html'), 500);
    } else {
      showToast(response.message, 'error');
    }
  });
});
