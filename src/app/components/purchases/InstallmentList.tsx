'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Installment {
  number: number;
  account: string;
  paymentMethod: string;
  description?: string;
  dueDate: Date;
  grossValue: number;
  netValue: number;
}

interface InstallmentListProps {
  installments: Installment[];
  onInstallmentsChange: (installments: Installment[]) => void;
}

export default function InstallmentList({ installments, onInstallmentsChange }: InstallmentListProps) {
  const [currentInstallment, setCurrentInstallment] = useState<Installment>({
    number: installments.length + 1,
    account: '',
    paymentMethod: '',
    description: '',
    dueDate: new Date(),
    grossValue: 0,
    netValue: 0
  });

  const handleAddInstallment = () => {
    if (currentInstallment.account && currentInstallment.paymentMethod) {
      onInstallmentsChange([...installments, currentInstallment]);
      setCurrentInstallment({
        number: installments.length + 2,
        account: '',
        paymentMethod: '',
        description: '',
        dueDate: new Date(),
        grossValue: 0,
        netValue: 0
      });
    }
  };

  const handleRemoveInstallment = (index: number) => {
    const newInstallments = installments.filter((_, i) => i !== index);
    // Renumera as parcelas
    const updatedInstallments = newInstallments.map((inst, i) => ({
      ...inst,
      number: i + 1
    }));
    onInstallmentsChange(updatedInstallments);
  };

  const calculateTotalGross = () => {
    return installments.reduce((total, inst) => total + inst.grossValue, 0);
  };

  const calculateTotalNet = () => {
    return installments.reduce((total, inst) => total + inst.netValue, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Parcelamento</h2>
        <button
          type="button"
          onClick={handleAddInstallment}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Adicionar Parcela
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <div>
          <input
            type="text"
            placeholder="Conta"
            value={currentInstallment.account}
            onChange={(e) => setCurrentInstallment({ ...currentInstallment, account: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Forma de Pagamento"
            value={currentInstallment.paymentMethod}
            onChange={(e) => setCurrentInstallment({ ...currentInstallment, paymentMethod: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Descrição"
            value={currentInstallment.description}
            onChange={(e) => setCurrentInstallment({ ...currentInstallment, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="date"
            value={currentInstallment.dueDate.toISOString().split('T')[0]}
            onChange={(e) => setCurrentInstallment({ ...currentInstallment, dueDate: new Date(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Valor Bruto"
            value={currentInstallment.grossValue}
            onChange={(e) => setCurrentInstallment({ ...currentInstallment, grossValue: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Valor Líquido"
            value={currentInstallment.netValue}
            onChange={(e) => setCurrentInstallment({ ...currentInstallment, netValue: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {installments.length > 0 && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center">Nº</th>
                <th className="px-4 py-2 text-left">Conta</th>
                <th className="px-4 py-2 text-left">Forma de Pagamento</th>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-center">Vencimento</th>
                <th className="px-4 py-2 text-right">Valor Bruto</th>
                <th className="px-4 py-2 text-right">Valor Líquido</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {installments.map((installment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{installment.number}</td>
                  <td className="px-4 py-2">{installment.account}</td>
                  <td className="px-4 py-2">{installment.paymentMethod}</td>
                  <td className="px-4 py-2">{installment.description}</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(installment.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {installment.grossValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {installment.netValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveInstallment(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-medium">
                  Total Bruto:
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {calculateTotalGross().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-medium">
                  Total Líquido:
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {calculateTotalNet().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
} 