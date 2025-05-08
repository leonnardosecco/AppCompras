'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/app/components/BackButton'
import { ClientSelect } from '@/app/components/ClientSelect'
import { ProjectSelect } from '@/app/components/ProjectSelect'
import { ShoppingBag, Plus, X, Calculator } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AutomaticInstallments } from '@/app/components/AutomaticInstallments'
import { useFormValidation } from '@/app/hooks/useFormValidation'
import CNPJInput from '@/app/components/CNPJInput'
import ErrorMessage from '@/app/components/ErrorMessage'
import ItemList from '@/app/components/purchases/ItemList'
import ServiceList from '@/app/components/purchases/ServiceList'
import InstallmentList from '@/app/components/purchases/InstallmentList'

interface Service {
  description: string;
  value: number;
  inssRetention: number;
  issRetention: number;
  irRetention: number;
  netValue: number;
}

interface Installment {
  account: string
  paymentMethod: string
  description: string
  nfEmission?: Date
  dueDate: Date
  netValue: number
  grossValue: number
}

interface Client {
  id: string
  name: string
  fantasyName: string
  cnpj: string
}

interface Project {
  id: string
  name: string
  color?: string
  clientId: string
}

interface NewPurchaseForm {
  number: number;
  date: string;
  company: string;
  clientId?: string;
  projectId?: string;
  observations?: string;
  items: {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  services: Service[];
  hasWithholdingTax: boolean;
  withholdingTaxValue: number;
  installments: {
    number: number;
    account: string;
    paymentMethod: string;
    description?: string;
    dueDate: Date;
    grossValue: number;
    netValue: number;
  }[];
}

interface CurrentService {
  description: string;
  value: number;
  inssRetention: number;
  issRetention: number;
  irRetention: number;
  netValue: number;
}

const validationRules = {
  number: { required: true, message: 'Número é obrigatório' },
  date: { required: true, message: 'Data é obrigatória' },
  company: { required: true, message: 'Empresa é obrigatória' },
  clientId: { required: true, message: 'Cliente é obrigatório' },
  projectId: { required: true, message: 'Projeto é obrigatório' },
}

export default function NewPurchasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  const {
    formData,
    setFormData,
    errors,
    handleChange,
    handleBlur,
    validateForm
  } = useFormValidation<NewPurchaseForm>({
    number: 0,
    date: new Date().toISOString().split('T')[0],
    company: '',
    clientId: undefined,
    projectId: undefined,
    observations: '',
    items: [],
    services: [],
    hasWithholdingTax: false,
    withholdingTaxValue: 0,
    installments: []
  }, validationRules)

  const [currentService, setCurrentService] = useState<CurrentService>({
    description: '',
    value: 0,
    inssRetention: 0,
    issRetention: 0,
    irRetention: 0,
    netValue: 0
  })

  const [currentInstallment, setCurrentInstallment] = useState<Installment>({
    account: '',
    paymentMethod: '',
    description: '',
    dueDate: new Date(),
    netValue: 0,
    grossValue: 0
  })

  useEffect(() => {
    const fetchNextNumber = async () => {
      try {
        const response = await fetch('/api/purchases/next-number')
        const data = await response.json()
        handleChange('number', data.nextNumber)
      } catch (error) {
        console.error('Erro ao buscar próximo número:', error)
        toast.error('Erro ao buscar número sequencial')
      }
    }
    fetchNextNumber()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erro ao criar compra')
      }

      toast.success('Compra criada com sucesso!')
      router.push('/dashboard/purchases')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar compra'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    handleChange('clientId', client.id)
    handleChange('projectId', undefined)
  }

  const handleProjectSelect = (project: Project) => {
    handleChange('projectId', project.id)
  }

  const calculateServiceTotal = (service: CurrentService) => {
    return service.value - (service.inssRetention + service.issRetention + service.irRetention);
  }

  const updateCurrentServiceTotal = () => {
    setCurrentService(prev => ({
      ...prev,
      total: calculateServiceTotal(prev)
    }))
  }

  useEffect(() => {
    updateCurrentServiceTotal()
  }, [currentService.value, currentService.quantity, currentService.discount])

  const handleAddService = () => {
    if (currentService.description && currentService.value > 0) {
      const newService: Service = {
        description: currentService.description,
        value: currentService.value,
        inssRetention: currentService.inssRetention,
        issRetention: currentService.issRetention,
        irRetention: currentService.irRetention,
        netValue: calculateServiceTotal(currentService)
      };
      setFormData({
        ...formData,
        services: [...formData.services, newService]
      });
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

  const handleAddInstallment = () => {
    if (currentInstallment.account && currentInstallment.paymentMethod) {
      const newInstallment = {
        ...currentInstallment,
        number: formData.installments.length + 1
      };
      setFormData({
        ...formData,
        installments: [...formData.installments, newInstallment]
      });
      setCurrentInstallment({
        account: '',
        paymentMethod: '',
        description: '',
        dueDate: new Date(),
        netValue: 0,
        grossValue: 0
      });
    }
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    })
  }

  const removeInstallment = (index: number) => {
    setFormData({
      ...formData,
      installments: formData.installments.filter((_, i) => i !== index)
    })
  }

  const calculateSubtotal = () => {
    return formData.services.reduce((total, service) => total + service.value, 0);
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return formData.hasWithholdingTax ? subtotal - formData.withholdingTaxValue : subtotal
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nova Compra</h1>
        <div className="text-gray-600">
          Número: {formData.number}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <ErrorMessage message={errors.date} />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              onBlur={() => handleBlur('company')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <ErrorMessage message={errors.company} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <ClientSelect onSelect={handleClientSelect} />
            <ErrorMessage message={errors.clientId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projeto *
            </label>
            <ProjectSelect 
              clientId={selectedClient?.id} 
              onSelect={handleProjectSelect}
            />
            <ErrorMessage message={errors.projectId} />
          </div>
        </div>

        <div>
          <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => handleChange('observations', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <ItemList
          items={formData.items}
          onItemsChange={(items) => handleChange('items', items)}
        />

        <ServiceList
          services={formData.services}
          onServicesChange={(services) => handleChange('services', services)}
        />

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Impostos Retidos</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasWithholdingTax}
                onChange={(e) => handleChange('hasWithholdingTax', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Possui impostos retidos?</span>
            </label>
            {formData.hasWithholdingTax && (
              <div className="flex-1 max-w-xs">
                <input
                  type="number"
                  placeholder="Valor dos impostos"
                  value={formData.withholdingTaxValue}
                  onChange={(e) => handleChange('withholdingTaxValue', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        <InstallmentList
          installments={formData.installments}
          onInstallmentsChange={(installments) => handleChange('installments', installments)}
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Compra'}
          </button>
        </div>
      </form>
    </div>
  )
} 