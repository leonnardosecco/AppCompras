'use client';

import { useState } from 'react';

interface CNPJInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}

export default function CNPJInput({ value, onChange, onBlur, className = '' }: CNPJInputProps) {
  const [displayValue, setDisplayValue] = useState(formatCNPJ(value));

  function formatCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length <= 14) {
      cnpj = cnpj.replace(/(\d{2})(\d)/, '$1.$2');
      cnpj = cnpj.replace(/(\d{3})(\d)/, '$1.$2');
      cnpj = cnpj.replace(/(\d{3})(\d)/, '$1/$2');
      cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return cnpj;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value.replace(/\D/g, '');
    setDisplayValue(formatCNPJ(rawValue));
    onChange(rawValue);
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      placeholder="00.000.000/0000-00"
      maxLength={18}
    />
  );
} 