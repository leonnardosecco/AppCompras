'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, X, Calculator } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Service {
  service: string;
  description: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

interface Installment {
  account: string;
  paymentMethod: string;
  description: string;
  nfEmission?: Date;
  dueDate: Date;
  receipt?: Date;
  grossValue: number;
  netValue: number;
  receivedValue?: number;
}

interface NewPedidoForm {
  number: string;
  date: string;
  company: string;
  clientId?: string;
  projectId?: string;
  observations?: string;
  services: Service[];
  hasWithholdingTax: boolean;
  withholdingTaxValue: number;
  installments: Installment[];
}

export default function NewPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [formData, setFormData] = useState<NewPedidoForm>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    company: '',
    clientId: undefined,
    projectId: undefined,
    observations: '',
    services: [],
    hasWithholdingTax: false,
    withholdingTaxValue: 0,
    installments: []
  });

  const [currentService, setCurrentService] = useState<Service>({
    service: '',
    description: '',
    price: 0,
    quantity: 1,
    discount: 0,
    total: 0
  });

  const [currentInstallment, setCurrentInstallment] = useState<Installment>({
    account: '',
    paymentMethod: '',
    description: 'Parcela [1/1]',
    dueDate: new Date(),
    grossValue: 0,
    netValue: 0
  });

  useEffect(() => {
    const fetchNextNumber = async () => {
      try {
        const response = await fetch('/api/pedidos/next-number');
        const data = await response.json();
        setFormData(prev => ({ ...prev, number: data.number }));
      } catch (error) {
        console.error('Erro ao buscar próximo número:', error);
        toast.error('Erro ao buscar número sequencial');
      }
    };
    fetchNextNumber();
  }, []);

  const handleAddService = () => {
    if (!currentService.service || currentService.price <= 0) {
      toast.error('Preencha os campos obrigatórios do serviço');
      return;
    }

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { ...currentService, total: currentService.price * currentService.quantity - currentService.discount }]
    }));

    setCurrentService({
      service: '',
      description: '',
      price: 0,
      quantity: 1,
      discount: 0,
      total: 0
    });
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleAddInstallment = () => {
    if (!currentInstallment.account || !currentInstallment.paymentMethod) {
      toast.error('Preencha os campos obrigatórios da parcela');
      return;
    }

    setFormData(prev => ({
      ...prev,
      installments: [...prev.installments, currentInstallment]
    }));

    setCurrentInstallment({
      account: '',
      paymentMethod: '',
      description: `Parcela [${formData.installments.length + 2}/x]`,
      dueDate: new Date(),
      grossValue: 0,
      netValue: 0
    });
  };

  const handleRemoveInstallment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.clientId || !formData.projectId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pedido');
      }

      toast.success('Pedido criado com sucesso!');
      router.push('/dashboard/pedidos');
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      toast.error('Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-xl font-semibold">Nova Venda de Serviço</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm mb-1">Número da venda</label>
            <input
              type="text"
              value={formData.number}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Data *</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <Calendar className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Empresa *</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Digite o nome da empresa"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Cliente</label>
            <div className="flex gap-2">
              <select
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                className="flex-1 px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {/* Lista de clientes aqui */}
              </select>
              <button
                type="button"
                onClick={() => setShowNewClientModal(true)}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Projeto ou Depto.</label>
            <div className="flex gap-2">
              <select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="flex-1 px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {/* Lista de projetos aqui */}
              </select>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(true)}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Observações</label>
          <textarea
            value={formData.observations}
            onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
          />
        </div>

        {/* Serviços */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Serviços</h2>
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-3">
              <label className="block text-sm mb-1">Serviço</label>
              <select
                value={currentService.service}
                onChange={(e) => setCurrentService(prev => ({ ...prev, service: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {/* Lista de serviços aqui */}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm mb-1">Descrição</label>
              <input
                type="text"
                value={currentService.description}
                onChange={(e) => setCurrentService(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1">Preço</label>
              <input
                type="number"
                value={currentService.price}
                onChange={(e) => setCurrentService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Quant.</label>
              <input
                type="number"
                value={currentService.quantity}
                onChange={(e) => setCurrentService(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Desconto R$</label>
              <input
                type="number"
                value={currentService.discount}
                onChange={(e) => setCurrentService(prev => ({ ...prev, discount: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Total</label>
              <div className="px-3 py-2 bg-gray-50 border rounded-md">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  currentService.price * currentService.quantity - currentService.discount
                )}
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de Serviços */}
          {formData.services.length > 0 && (
            <div className="mt-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Serviço</th>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-right">Preço</th>
                    <th className="px-4 py-2 text-right">Quant.</th>
                    <th className="px-4 py-2 text-right">Desconto</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.services.map((service, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{service.service}</td>
                      <td className="px-4 py-2">{service.description}</td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                      </td>
                      <td className="px-4 py-2 text-right">{service.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.discount)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.total)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right font-medium">Total:</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        formData.services.reduce((sum, service) => sum + service.total, 0)
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Impostos Retidos */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Impostos retidos</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Imposto Retido?</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={formData.hasWithholdingTax}
                    onChange={() => setFormData(prev => ({ ...prev, hasWithholdingTax: true }))}
                    className="text-blue-500"
                  />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={!formData.hasWithholdingTax}
                    onChange={() => setFormData(prev => ({ ...prev, hasWithholdingTax: false, withholdingTaxValue: 0 }))}
                    className="text-blue-500"
                  />
                  <span>Não</span>
                </label>
              </div>
            </div>
            {formData.hasWithholdingTax && (
              <div className="flex items-center gap-2">
                <label className="text-sm">Valor a receber</label>
                <input
                  type="number"
                  value={formData.withholdingTaxValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, withholdingTaxValue: parseFloat(e.target.value) }))}
                  className="px-3 py-2 border rounded-md"
                  step="0.01"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Parcelamento */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Parcelamento</h2>
            <button
              type="button"
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Calculator className="h-5 w-5" />
              Parcelamento automático
            </button>
          </div>

          <div className="grid grid-cols-8 gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">Conta</label>
              <select
                value={currentInstallment.account}
                onChange={(e) => setCurrentInstallment(prev => ({ ...prev, account: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {/* Lista de contas aqui */}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Forma de Pagamento</label>
              <select
                value={currentInstallment.paymentMethod}
                onChange={(e) => setCurrentInstallment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {/* Lista de formas de pagamento aqui */}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1">Descrição</label>
              <input
                type="text"
                value={currentInstallment.description}
                onChange={(e) => setCurrentInstallment(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Emissão da NF</label>
              <input
                type="date"
                value={currentInstallment.nfEmission?.toISOString().split('T')[0]}
                onChange={(e) => setCurrentInstallment(prev => ({ ...prev, nfEmission: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Vencimento</label>
              <input
                type="date"
                value={currentInstallment.dueDate.toISOString().split('T')[0]}
                onChange={(e) => setCurrentInstallment(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Valor Líquido</label>
              <input
                type="number"
                value={currentInstallment.netValue}
                onChange={(e) => setCurrentInstallment(prev => ({ ...prev, netValue: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddInstallment}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de Parcelas */}
          {formData.installments.length > 0 && (
            <div className="mt-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Conta</th>
                    <th className="px-4 py-2 text-left">Forma de Pagamento</th>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-center">Emissão NF</th>
                    <th className="px-4 py-2 text-center">Vencimento</th>
                    <th className="px-4 py-2 text-right">Valor Líquido</th>
                    <th className="px-4 py-2 text-right">Valor Bruto</th>
                    <th className="px-4 py-2 text-center">Recebimento</th>
                    <th className="px-4 py-2 text-right">Valor Recebido</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.installments.map((installment, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{installment.account}</td>
                      <td className="px-4 py-2">{installment.paymentMethod}</td>
                      <td className="px-4 py-2">{installment.description}</td>
                      <td className="px-4 py-2 text-center">
                        {installment.nfEmission?.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {installment.dueDate.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.netValue)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.grossValue)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {installment.receipt?.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {installment.receivedValue
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.receivedValue)
                          : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveInstallment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right font-medium">Total:</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        formData.installments.reduce((sum, inst) => sum + inst.netValue, 0)
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        formData.installments.reduce((sum, inst) => sum + inst.grossValue, 0)
                      )}
                    </td>
                    <td></td>
                    <td className="px-4 py-2 text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        formData.installments.reduce((sum, inst) => sum + (inst.receivedValue || 0), 0)
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </form>

      {/* Modal de Novo Cliente */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Novo Cliente</h3>
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Formulário de novo cliente aqui */}
          </div>
        </div>
      )}

      {/* Modal de Novo Projeto */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Novo Projeto ou Depto.</h3>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Formulário de novo projeto aqui */}
          </div>
        </div>
      )}
    </div>
  );
} 