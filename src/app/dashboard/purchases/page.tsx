'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItemList from '@/app/components/purchases/ItemList';
import ServiceList from '@/app/components/purchases/ServiceList';
import InstallmentList from '@/app/components/purchases/InstallmentList';

interface Client {
  id: string;
  name: string;
  cnpj: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

interface Purchase {
  id?: string;
  number: string;
  clientId: string;
  projectId: string;
  cnpj: string;
  items: any[];
  services: any[];
  installments: any[];
  totalValue: number;
  totalServices: number;
  totalRetentions: number;
  netTotal: number;
}

export default function PurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nextNumber, setNextNumber] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [purchase, setPurchase] = useState<Purchase>({
    number: '',
    clientId: '',
    projectId: '',
    cnpj: '',
    items: [],
    services: [],
    installments: [],
    totalValue: 0,
    totalServices: 0,
    totalRetentions: 0,
    netTotal: 0
  });

  useEffect(() => {
    fetchNextNumber();
  }, []);

  const fetchNextNumber = async () => {
    try {
      const response = await fetch('/api/purchases/next-number');
      const data = await response.json();
      setNextNumber(data.number);
      setPurchase(prev => ({ ...prev, number: data.number }));
    } catch (error) {
      console.error('Erro ao buscar próximo número:', error);
    }
  };

  const handleCNPJSearch = async (cnpj: string) => {
    try {
      const response = await fetch(`/api/cnpj/${cnpj}`);
      const data = await response.json();
      // Atualizar dados do cliente com informações do CNPJ
      setPurchase(prev => ({
        ...prev,
        cnpj,
        // Outros dados do CNPJ
      }));
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    }
  };

  const calculateTotals = () => {
    const itemsTotal = purchase.items.reduce((sum, item) => sum + item.total, 0);
    const servicesTotal = purchase.services.reduce((sum, service) => sum + service.value, 0);
    const retentionsTotal = purchase.services.reduce((sum, service) => 
      sum + service.inssRetention + service.issRetention + service.irRetention, 0);
    const netTotal = itemsTotal + servicesTotal - retentionsTotal;

    setPurchase(prev => ({
      ...prev,
      totalValue: itemsTotal,
      totalServices: servicesTotal,
      totalRetentions: retentionsTotal,
      netTotal
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [purchase.items, purchase.services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchase),
      });

      if (response.ok) {
        router.push('/dashboard/purchases');
      }
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nova Compra</h1>
        <div className="text-gray-600">
          Número: {purchase.number}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block mb-2">CNPJ</label>
            <input
              type="text"
              value={purchase.cnpj}
              onChange={(e) => {
                const cnpj = e.target.value;
                setPurchase(prev => ({ ...prev, cnpj }));
                if (cnpj.length === 14) {
                  handleCNPJSearch(cnpj);
                }
              }}
              className="w-full p-2 border rounded bg-white"
              placeholder="Digite o CNPJ"
            />
          </div>

          <div>
            <label className="block mb-2">Cliente</label>
            <input
              type="text"
              value={selectedClient?.name || ''}
              className="w-full p-2 border rounded bg-white"
              placeholder="Selecione o cliente"
              readOnly
            />
          </div>

          <div>
            <label className="block mb-2">Projeto</label>
            <input
              type="text"
              value={selectedProject?.name || ''}
              className="w-full p-2 border rounded bg-white"
              placeholder="Selecione o projeto"
              readOnly
            />
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Itens</h2>
          <ItemList
            items={purchase.items}
            onItemsChange={(items) => setPurchase(prev => ({ ...prev, items }))}
          />
        </div>

        {/* Serviços */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Serviços</h2>
          <ServiceList
            services={purchase.services}
            onServicesChange={(services) => setPurchase(prev => ({ ...prev, services }))}
          />
        </div>

        {/* Parcelamento */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Parcelamento</h2>
          <InstallmentList
            totalValue={purchase.netTotal}
            installments={purchase.installments}
            onInstallmentsChange={(installments) => setPurchase(prev => ({ ...prev, installments }))}
          />
        </div>

        {/* Totais */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-end space-x-8">
            <div className="text-right">
              <div className="mb-2">Total Itens: R$ {purchase.totalValue.toFixed(2)}</div>
              <div className="mb-2">Total Serviços: R$ {purchase.totalServices.toFixed(2)}</div>
              <div className="mb-2">Total Retenções: R$ {purchase.totalRetentions.toFixed(2)}</div>
              <div className="text-xl font-bold">
                Valor Total: R$ {purchase.netTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Salvando...' : 'Salvar Compra'}
          </button>
        </div>
      </form>
    </div>
  );
} 