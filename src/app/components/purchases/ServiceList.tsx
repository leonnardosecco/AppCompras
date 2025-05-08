'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Service {
  description: string;
  value: number;
  inssRetention: number;
  issRetention: number;
  irRetention: number;
  netValue: number;
}

interface ServiceListProps {
  services: Service[];
  onServicesChange: (services: Service[]) => void;
}

export default function ServiceList({ services, onServicesChange }: ServiceListProps) {
  const [currentService, setCurrentService] = useState<Service>({
    description: '',
    value: 0,
    inssRetention: 0,
    issRetention: 0,
    irRetention: 0,
    netValue: 0
  });

  const calculateNetValue = (service: Service) => {
    return service.value - service.inssRetention - service.issRetention - service.irRetention;
  };

  const handleAddService = () => {
    if (currentService.description && currentService.value > 0) {
      const newService = {
        ...currentService,
        netValue: calculateNetValue(currentService)
      };
      onServicesChange([...services, newService]);
      setCurrentService({
        description: '',
        value: 0,
        inssRetention: 0,
        issRetention: 0,
        irRetention: 0,
        netValue: 0
      });
    }
  };

  const handleRemoveService = (index: number) => {
    onServicesChange(services.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return services.reduce((total, service) => total + service.value, 0);
  };

  const calculateTotalRetentions = () => {
    return services.reduce((total, service) => 
      total + service.inssRetention + service.issRetention + service.irRetention, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Serviços</h2>
        <button
          type="button"
          onClick={handleAddService}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Adicionar Serviço
        </button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Descrição do Serviço"
            value={currentService.description}
            onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Valor"
            value={currentService.value}
            onChange={(e) => setCurrentService({ ...currentService, value: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="INSS"
            value={currentService.inssRetention}
            onChange={(e) => setCurrentService({ ...currentService, inssRetention: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="ISS"
            value={currentService.issRetention}
            onChange={(e) => setCurrentService({ ...currentService, issRetention: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="IR"
            value={currentService.irRetention}
            onChange={(e) => setCurrentService({ ...currentService, irRetention: parseFloat(e.target.value) })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {services.length > 0 && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-gray-900">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Descrição</th>
                <th className="px-4 py-2 text-right">Valor</th>
                <th className="px-4 py-2 text-right">INSS</th>
                <th className="px-4 py-2 text-right">ISS</th>
                <th className="px-4 py-2 text-right">IR</th>
                <th className="px-4 py-2 text-right">Valor Líquido</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{service.description}</td>
                  <td className="px-4 py-2 text-right">
                    {service.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {service.inssRetention.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {service.issRetention.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {service.irRetention.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {service.netValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
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
                  Total:
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-medium">
                  Total Retenções:
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  {calculateTotalRetentions().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
} 