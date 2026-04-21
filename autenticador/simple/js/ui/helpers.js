

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconClass = type === 'error' ? 'toast-icon-error' : 'toast-icon-success';
  toast.innerHTML = `<span class="toast-icon ${iconClass}">${type === 'success' ? '✓' : '⚠'}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-fading');
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 300);
  }, 3000);
}

export function clearErrors(fieldIds) {
  fieldIds.forEach(id => {
    const input = document.getElementById(id);
    const errObj = document.getElementById(`${id}-error`);
    if (input) input.classList.remove('has-error');
    if (errObj) errObj.textContent = '';
  });
}

export function setFieldError(id, message) {
  const input = document.getElementById(id);
  const errObj = document.getElementById(`${id}-error`);
  if (input) input.classList.add('has-error');
  if (errObj) errObj.textContent = message;
}

export function setLoading(buttonId, text, isLoading) {
  const btn = document.getElementById(buttonId);
  if (btn) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? text : (btn.dataset.originalText || text);
    if (!btn.dataset.originalText && isLoading) {
      btn.dataset.originalText = text; 
    }
  }
}
