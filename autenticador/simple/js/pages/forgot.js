import { initStorage } from '../data/store.js';
import { startPasswordRecovery, finishPasswordRecovery } from '../business/authService.js';
import { showToast, clearErrors, setFieldError, setLoading } from '../ui/helpers.js';
import { validateEmail, validatePassword, runValidations } from '../ui/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initStorage();

  const reqCard = document.getElementById('card-request');
  const resCard = document.getElementById('card-reset');

  const formRequest = document.getElementById('forgot-form');
  const formReset = document.getElementById('reset-form');

  formRequest.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(['forgot-email']);

    if (runValidations({ 'forgot-email': validateEmail }, setFieldError)) {
      return;
    }

    const email = document.getElementById('forgot-email').value;
    setLoading('btn-request', 'Verificando...', true);
    
    const result = await startPasswordRecovery(email);
    
    setLoading('btn-request', 'Verificar correo', false);

    if (result.success) {
      showToast(result.message, 'success');
      reqCard.classList.add('hidden');
      resCard.classList.remove('hidden');
    } else {
      showToast(result.message, 'error');
    }
  });


  formReset.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(['reset-password']);

    if (runValidations({ 'reset-password': validatePassword }, setFieldError)) {
      return;
    }

    const newPwd = document.getElementById('reset-password').value;
    setLoading('btn-reset', 'Actualizando...', true);

    const result = await finishPasswordRecovery(newPwd);

    setLoading('btn-reset', 'Actualizar acceso', false);

    if (result.success) {
      showToast(result.message, 'success');
      setTimeout(() => window.location.replace('./index.html'), 1500);
    } else {
      showToast(result.message, 'error');
    }
  });

});
