'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface NewProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProjectFormData {
  name: string;
  clientId: string;
  color: string;
  isActive: boolean;
}

export default function NewProjectForm({ onSuccess, onCancel }: NewProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientId: '',
    color: '#0000FF', // Azul como cor padrão
    isActive: true
  });

  const colors = [
    '#0000FF', '#4169E1', '#87CEEB', '#00CED1', '#98FB98', '#FFD700',
    '#90EE90', '#98FB98', '#32CD32', '#008000', '#FFA500', '#FF4500',
    '#FF0000', '#FF69B4', '#8B4513', '#A0522D', '#000000', '#808080',
    '#C0C0C0', '#FFFFFF', '#00FFFF', '#FF00FF', '#800080', '#4B0082'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar projeto');
      }

      toast.success('Projeto criado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast.error('Erro ao criar projeto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ativo
        </label>
        <div className="h-[42px] flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-5 w-5 text-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cor
        </label>
        <div className="grid grid-cols-12 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color }))}
              className={`w-6 h-6 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente
        </label>
        <select
          value={formData.clientId}
          onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Selecione...</option>
          {/* Lista de clientes aqui */}
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Salvar
        </button>
      </div>
    </form>
  );
} 