

export const validateRequired = (val) => {
  if (!val || val.trim() === '') return 'Campo obligatorio';
  return null;
};

export const validateEmail = (val) => {
  const req = validateRequired(val);
  if (req) return req;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(val)) return 'Correo inválido';
  return null;
};

export const validateUsername = (val) => {
  const req = validateRequired(val);
  if (req) return req;
  if (!/^[a-zA-Z0-9.\-_]{3,30}$/.test(val)) return 'Mín. 3 alfanuméricos';
  return null;
};

export const validatePassword = (val) => {
  const req = validateRequired(val);
  if (req) return req;
  if (val.length < 6) return 'Mínimo 6 caracteres';
  return null;
};


export function runValidations(fieldsObj, setFieldErrorFn) {
  let hasErrors = false;
  for (const [fieldId, validationRule] of Object.entries(fieldsObj)) {
    const value = document.getElementById(fieldId).value;
    const errorMsg = validationRule(value);
    if (errorMsg) {
      setFieldErrorFn(fieldId, errorMsg);
      hasErrors = true;
    }
  }
  return hasErrors;
}
