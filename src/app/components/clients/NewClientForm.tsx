'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface NewClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ClientFormData {
  fantasyName: string;
  companyName: string;
  municipalRegistration: string;
  stateRegistration: string;
  type: 'PF' | 'PJ';
  document: string;
  email: string;
  phone: string;
  pix: string;
  observations: string;
  isActive: boolean;
}

export default function NewClientForm({ onSuccess, onCancel }: NewClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    fantasyName: '',
    companyName: '',
    municipalRegistration: '',
    stateRegistration: '',
    type: 'PJ',
    document: '',
    email: '',
    phone: '',
    pix: '',
    observations: '',
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar cliente');
      }

      toast.success('Cliente criado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Fantasia *
          </label>
          <input
            type="text"
            value={formData.fantasyName}
            onChange={(e) => setFormData(prev => ({ ...prev, fantasyName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razão Social
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inscrição Municipal
          </label>
          <input
            type="text"
            value={formData.municipalRegistration}
            onChange={(e) => setFormData(prev => ({ ...prev, municipalRegistration: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inscrição Estadual
          </label>
          <input
            type="text"
            value={formData.stateRegistration}
            onChange={(e) => setFormData(prev => ({ ...prev, stateRegistration: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'PF' | 'PJ' }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF/CNPJ
          </label>
          <input
            type="text"
            value={formData.document}
            onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
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
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PIX
        </label>
        <select
          value={formData.pix}
          onChange={(e) => setFormData(prev => ({ ...prev, pix: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Selecione...</option>
          <option value="cpf">CPF</option>
          <option value="cnpj">CNPJ</option>
          <option value="email">E-mail</option>
          <option value="phone">Telefone</option>
          <option value="random">Chave Aleatória</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          value={formData.observations}
          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
        />
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