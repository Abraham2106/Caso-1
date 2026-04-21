import { initStorage } from '../data/store.js';
import { register, getActiveSession } from '../business/authService.js';
import { showToast, clearErrors, setFieldError, setLoading } from '../ui/helpers.js';
import { validateRequired, validateEmail, validateUsername, validatePassword, runValidations } from '../ui/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initStorage();
  
  if (getActiveSession()) {
    window.location.replace('./dashboard.html');
    return;
  }

  const form = document.getElementById('register-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fields = ['reg-name', 'reg-email', 'reg-username', 'reg-password', 'reg-confirm'];
    clearErrors(fields);

    
    let hasErrors = runValidations({
      'reg-name': validateRequired,
      'reg-email': validateEmail,
      'reg-username': validateUsername,
      'reg-password': validatePassword
    }, setFieldError);

    
    const pwd = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (!validateRequired(confirm) && pwd !== confirm) {
      setFieldError('reg-confirm', 'Las contraseñas no coinciden');
      hasErrors = true;
    } else if (validateRequired(confirm)) {
      setFieldError('reg-confirm', 'Campo obligatorio');
      hasErrors = true;
    }

    if (hasErrors) {
      showToast('Verifique los errores en el formulario', 'error');
      return;
    }

    setLoading('btn-submit', 'Registrando...', true);

    const data = {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      username: document.getElementById('reg-username').value,
      password: pwd
    };

    const response = await register(data);
    setLoading('btn-submit', 'Registrarse', false);

    if (response.success) {
      showToast(response.message, 'success');
      setTimeout(() => window.location.replace('./dashboard.html'), 500);
    } else {
      showToast(response.message, 'error');
    }
  });
});
