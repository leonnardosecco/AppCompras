import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    message?: string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends object>(initialState: T, validationRules: ValidationRules) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((name: string, value: any) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.message || 'Este campo é obrigatório';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Mínimo de ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Máximo de ${rules.maxLength} caracteres`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Formato inválido';
    }

    if (rules.custom && !rules.custom(value)) {
      return rules.message || 'Valor inválido';
    }

    return '';
  }, [validationRules]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name as string]) {
      const error = validateField(name as string, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof T]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [formData, validateField]);

  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName as keyof T]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules, validateField]);

  return {
    formData,
    setFormData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
  };
} 