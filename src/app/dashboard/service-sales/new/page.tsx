'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

type Client = {
  id: string
  fantasyName: string
}

type Project = {
  id: string
  name: string
  clientId: string
}

type ServiceItem = {
  id: string
  serviceType: string
  description: string
  price: number
  quantity: number
  discount: number
  total: number
}

type ServiceInstallment = {
  id: string
  number: number
  account: string
  paymentMethod: string
  description: string
  nfEmission: string | null
  dueDate: string
  receipt: string | null
  grossValue: number
  netValue: number
  receivedValue: number | null
}

export default function NewServiceSalePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estado do formulário
  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    projectId: '',
    observations: '',
    taxRetention: false,
    taxValue: 0,
    totalValue: 0,
    receivableValue: 0,
  })

  // Estado para itens e parcelas
  const [items, setItems] = useState<ServiceItem[]>([])
  const [installments, setInstallments] = useState<ServiceInstallment[]>([])

  // Carregar clientes e projetos
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [clientsResponse, projectsResponse] = await Promise.all([
          fetch('/api/clients?active=true'),
          fetch('/api/projects?active=true')
        ])

        const clientsData = await clientsResponse.json()
        const projectsData = await projectsResponse.json()

        setClients(clientsData)
        setProjects(projectsData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados iniciais')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar projetos quando o cliente muda
  useEffect(() => {
    if (formData.clientId) {
      const filtered = projects.filter(project => project.clientId === formData.clientId)
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects(projects)
    }
  }, [formData.clientId, projects])

  // Funções de manipulação de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = parseFloat(value) || 0
    setFormData(prev => ({ ...prev, [name]: numericValue }))
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Venda de Serviço</h1>
        <button
          onClick={() => router.push('/dashboard/service-sales')}
          className="text-blue-600 hover:text-blue-800"
        >
          Voltar
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Carregando...</p>
        </div>
      ) : (
        <form className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Informações Gerais */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Venda
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  required
                  value={formData.number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.fantasyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Projeto/Departamento
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um projeto</option>
                  {filteredProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  id="observations"
                  name="observations"
                  rows={3}
                  value={formData.observations}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Seção de Impostos Retidos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Impostos Retidos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="taxRetention"
                    name="taxRetention"
                    checked={formData.taxRetention}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="taxRetention" className="ml-2 block text-sm font-medium text-gray-700">
                    Imposto Retido?
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="taxValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Impostos Retidos (R$)
                </label>
                <input
                  type="number"
                  id="taxValue"
                  name="taxValue"
                  min="0"
                  step="0.01"
                  disabled={!formData.taxRetention}
                  value={formData.taxValue}
                  onChange={handleNumberInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    !formData.taxRetention ? 'bg-gray-100 text-gray-500' : 'border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label htmlFor="receivableValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor a Receber (R$)
                </label>
                <input
                  type="text"
                  id="receivableValue"
                  name="receivableValue"
                  disabled
                  value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.receivableValue)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 font-medium"
                />
              </div>
            </div>
          </div>
          
          {/* Seção de Parcelamento */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parcelamento</h2>
            
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  // Implementar lógica para adicionar parcela única
                  const newInstallment: ServiceInstallment = {
                    id: Date.now().toString(),
                    number: 1,
                    account: '',
                    paymentMethod: '',
                    description: 'Parcela 1/1',
                    nfEmission: null,
                    dueDate: new Date().toISOString().split('T')[0],
                    receipt: null,
                    grossValue: formData.totalValue,
                    netValue: formData.receivableValue,
                    receivedValue: null
                  }
                  setInstallments([newInstallment])
                }}
              >
                + Adicionar Parcela
              </button>
              
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => {
                  // Implementar lógica de parcelamento automático (futuro)
                  toast.error('Funcionalidade em desenvolvimento')
                }}
              >
                Parcelamento Automático
              </button>
            </div>
            
            {installments.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conta</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forma Pag.</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emissão NF</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Bruto</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Líquido</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {installments.map((installment) => (
                      <tr key={installment.id}>
                        <td className="px-3 py-3 text-sm">
                          <select
                            value={installment.account}
                            onChange={(e) => {
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, account: e.target.value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Selecione</option>
                            <option value="Conta Principal">Conta Principal</option>
                            <option value="Conta Secundária">Conta Secundária</option>
                          </select>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <select
                            value={installment.paymentMethod}
                            onChange={(e) => {
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, paymentMethod: e.target.value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Selecione</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Cartão">Cartão</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="PIX">PIX</option>
                            <option value="Transferência">Transferência</option>
                          </select>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <input
                            type="text"
                            value={installment.description || ''}
                            onChange={(e) => {
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, description: e.target.value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <input
                            type="date"
                            value={installment.nfEmission || ''}
                            onChange={(e) => {
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, nfEmission: e.target.value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <input
                            type="date"
                            value={installment.dueDate}
                            onChange={(e) => {
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, dueDate: e.target.value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={installment.grossValue}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, grossValue: value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={installment.netValue}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0
                              const updatedInstallments = installments.map(item => 
                                item.id === installment.id ? { ...item, netValue: value } : item
                              )
                              setInstallments(updatedInstallments)
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setInstallments(installments.filter(item => item.id !== installment.id))
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-gray-50">
                <p className="text-gray-500">Nenhuma parcela adicionada</p>
              </div>
            )}
          </div>
          
          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard/service-sales')}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSaving || items.length === 0 || installments.length === 0}
              onClick={async () => {
                // Implementar lógica de salvar
                setIsSaving(true)
                
                try {
                  // Validações
                  if (!formData.number) {
                    toast.error('O número da venda é obrigatório')
                    return
                  }
                  
                  if (items.length === 0) {
                    toast.error('Adicione pelo menos um serviço')
                    return
                  }
                  
                  if (installments.length === 0) {
                    toast.error('Adicione pelo menos uma parcela')
                    return
                  }
                  
                  // Mapear dados para o formato da API
                  const serviceSaleData = {
                    ...formData,
                    items: items.map(({ id, ...rest }) => rest),
                    installments: installments.map(({ id, ...rest }) => rest)
                  }
                  
                  // Chamar API para salvar
                  const response = await fetch('/api/service-sales', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(serviceSaleData)
                  })
                  
                  if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.message || 'Erro ao salvar venda de serviço')
                  }
                  
                  toast.success('Venda de serviço salva com sucesso!')
                  router.push('/dashboard/service-sales')
                } catch (error) {
                  console.error('Erro ao salvar venda:', error)
                  toast.error('Erro ao salvar venda de serviço')
                } finally {
                  setIsSaving(false)
                }
              }}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 