'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Plus, Trash2, Calendar, Save, UserPlus, FolderPlus, X } from 'lucide-react'
import ClientModal from '@/app/components/ClientModal'
import ProjectModal from '@/app/components/ProjectModal'

interface Client {
  id: string
  fantasyName: string
}

interface Project {
  id: string
  name: string
  color: string
  clientId: string
}

interface PurchaseRequestItem {
  id?: string
  description: string
  quantity: number
  unit: string
  estimatedPrice: number | null
  justification?: string
  urgency?: string
}

interface Installment {
  account: string
  paymentMethod: string
  description: string
  nfEmission: string
  boleto: string
  dueDate: string
  netValue: number | null
  grossValue: number | null
  receivedValue: number | null
}

interface GenerateInstallmentsModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (installments: Installment[]) => void
  totalValue: number
}

function GenerateInstallmentsModal({ isOpen, onClose, onGenerate, totalValue }: GenerateInstallmentsModalProps) {
  const [activeTab, setActiveTab] = useState<'fixed' | 'percentage'>('fixed')
  const [account, setAccount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [description, setDescription] = useState('')
  const [installmentsPattern, setInstallmentsPattern] = useState('')
  const [value, setValue] = useState(totalValue)
  const [prefilledReceivedValue, setPrefilledReceivedValue] = useState(false)
  
  // Para a aba Percentual
  const [parcelsCount, setParcelsCount] = useState(2)
  const [percentages, setPercentages] = useState<number[]>([50, 50])

  useEffect(() => {
    // Ajusta o array de percentagens quando a quantidade de parcelas muda
    if (activeTab === 'percentage') {
      const defaultPercentage = 100 / parcelsCount
      const newPercentages = Array(parcelsCount).fill(defaultPercentage)
      setPercentages(newPercentages)
    }
  }, [parcelsCount, activeTab])

  const handlePercentageChange = (index: number, value: number) => {
    const newPercentages = [...percentages]
    newPercentages[index] = value
    setPercentages(newPercentages)
  }

  const handleParcelsCountChange = (value: string) => {
    const count = parseInt(value)
    if (!isNaN(count) && count > 0 && count <= 12) {
      setParcelsCount(count)
    }
  }

  const getTotalPercentage = () => {
    return percentages.reduce((sum, percent) => sum + percent, 0)
  }

  const handleGenerate = () => {
    if (!account || !paymentMethod) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    if (activeTab === 'fixed') {
      if (!installmentsPattern) {
        toast.error('Preencha o padrão de parcelas')
        return
      }

      try {
        // Exemplos: 30 60 (30 e 60 dias), 0 (à vista), 6x (6 parcelas iguais), 0 2x (entrada mais 2 parcelas iguais)
        let installments: Installment[] = []
        
        // Caso em que apenas um número é digitado (exemplo: "5" para 5 parcelas mensais)
        if (/^\d+$/.test(installmentsPattern)) {
          const count = parseInt(installmentsPattern)
          if (isNaN(count) || count <= 0) {
            throw new Error('Quantidade de parcelas inválida')
          }
          
          const installmentValue = value / count
          
          for (let i = 0; i < count; i++) {
            const dueDate = new Date()
            dueDate.setMonth(dueDate.getMonth() + i) // i meses a partir de hoje
            
            installments.push({
              account,
              paymentMethod,
              description: `${description} - Parcela ${i + 1}/${count}`,
              nfEmission: '',
              boleto: '',
              dueDate: dueDate.toISOString().split('T')[0],
              netValue: installmentValue,
              grossValue: installmentValue,
              receivedValue: prefilledReceivedValue ? installmentValue : null
            })
          }
        }
        // Parcelas iguais (ex: 6x)
        else if (installmentsPattern.endsWith('x')) {
          const count = parseInt(installmentsPattern.replace('x', ''))
          if (isNaN(count) || count <= 0) {
            throw new Error('Formato inválido para parcelas iguais')
          }
          
          const installmentValue = value / count
          
          for (let i = 0; i < count; i++) {
            const dueDate = new Date()
            dueDate.setMonth(dueDate.getMonth() + i) // Alterado para ser mensal
            
            installments.push({
              account,
              paymentMethod,
              description: `${description} - Parcela ${i + 1}/${count}`,
              nfEmission: '',
              boleto: '',
              dueDate: dueDate.toISOString().split('T')[0],
              netValue: installmentValue,
              grossValue: installmentValue,
              receivedValue: prefilledReceivedValue ? installmentValue : null
            })
          }
        }
        // Entrada + parcelas iguais (ex: 0 2x)
        else if (installmentsPattern.includes(' ') && installmentsPattern.includes('x')) {
          const parts = installmentsPattern.split(' ')
          const initialDays = parseInt(parts[0])
          const remainingPart = parts[1]
          
          if (isNaN(initialDays) || !remainingPart.endsWith('x')) {
            throw new Error('Formato inválido para entrada + parcelas')
          }
          
          const remainingCount = parseInt(remainingPart.replace('x', ''))
          if (isNaN(remainingCount) || remainingCount <= 0) {
            throw new Error('Formato inválido para parcelas restantes')
          }
          
          // Entrada
          const initialDate = new Date()
          initialDate.setDate(initialDate.getDate() + initialDays)
          
          // Se for 0, é pagamento à vista
          if (remainingCount === 0) {
            installments.push({
              account,
              paymentMethod,
              description: `${description} - À vista`,
              nfEmission: '',
              boleto: '',
              dueDate: initialDate.toISOString().split('T')[0],
              netValue: value,
              grossValue: value,
              receivedValue: prefilledReceivedValue ? value : null
            })
          } else {
            // Valor da entrada (consideramos igual às demais parcelas para simplicidade)
            const installmentValue = value / (remainingCount + 1)
            
            // Entrada
            installments.push({
              account,
              paymentMethod,
              description: `${description} - Entrada`,
              nfEmission: '',
              boleto: '',
              dueDate: initialDate.toISOString().split('T')[0],
              netValue: installmentValue,
              grossValue: installmentValue,
              receivedValue: prefilledReceivedValue ? installmentValue : null
            })
            
            // Parcelas restantes
            for (let i = 0; i < remainingCount; i++) {
              const dueDate = new Date()
              dueDate.setMonth(dueDate.getMonth() + i + 1) // Alterado para ser mensal
              
              installments.push({
                account,
                paymentMethod,
                description: `${description} - Parcela ${i + 1}/${remainingCount}`,
                nfEmission: '',
                boleto: '',
                dueDate: dueDate.toISOString().split('T')[0],
                netValue: installmentValue,
                grossValue: installmentValue,
                receivedValue: prefilledReceivedValue ? installmentValue : null
              })
            }
          }
        }
        // Dias específicos (ex: 30 60 90)
        else {
          const days = installmentsPattern.split(' ').map(d => parseInt(d))
          if (days.some(d => isNaN(d))) {
            throw new Error('Formato inválido para dias específicos')
          }
          
          const installmentValue = value / days.length
          
          days.forEach((day, index) => {
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + day)
            
            installments.push({
              account,
              paymentMethod,
              description: `${description} - Parcela ${index + 1}/${days.length}`,
              nfEmission: '',
              boleto: '',
              dueDate: dueDate.toISOString().split('T')[0],
              netValue: installmentValue,
              grossValue: installmentValue,
              receivedValue: prefilledReceivedValue ? installmentValue : null
            })
          })
        }

        onGenerate(installments)
        onClose()
      } catch (error) {
        toast.error('Erro ao gerar parcelas: ' + (error instanceof Error ? error.message : 'Formato inválido'))
      }
    } else {
      // Aba Percentual
      const totalPercent = getTotalPercentage()
      if (Math.abs(totalPercent - 100) > 0.01) {
        toast.error(`A soma das porcentagens deve ser 100%. Atual: ${totalPercent.toFixed(2)}%`)
        return
      }

      try {
        const installments: Installment[] = []
        
        for (let i = 0; i < parcelsCount; i++) {
          const installmentValue = (value * percentages[i]) / 100
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + (i + 1) * 30) // 30 dias entre parcelas
          
          installments.push({
            account,
            paymentMethod,
            description: `${description} - Parcela ${i + 1}/${parcelsCount}`,
            nfEmission: '',
            boleto: '',
            dueDate: dueDate.toISOString().split('T')[0],
            netValue: installmentValue,
            grossValue: installmentValue,
            receivedValue: prefilledReceivedValue ? installmentValue : null
          })
        }
        
        onGenerate(installments)
        onClose()
      } catch (error) {
        toast.error('Erro ao gerar parcelas: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Gerar Parcelas</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Aviso */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">
                  Atenção!
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Gerar novas parcelas irá excluir a(s) anterior(es).
                </p>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div className="flex mb-4">
            <button
              className={`py-2 px-4 ${activeTab === 'fixed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('fixed')}
            >
              Parcelas Fixas
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'percentage' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveTab('percentage')}
            >
              Percentual
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta <span className="text-red-500">*</span>
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Banco">Banco</option>
                  <option value="Caixa">Caixa</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Boleto">Boleto</option>
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Descrição das parcelas"
              />
            </div>
            
            {activeTab === 'fixed' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">R$</span>
                    <input
                      type="number"
                      value={value === 0 ? '' : value}
                      onChange={(e) => setValue(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full p-2 pl-10 border rounded-md"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parcelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={installmentsPattern}
                    onChange={(e) => setInstallmentsPattern(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="30 60 (30 e 60 dias)"
                    required
                  />
                </div>
                
                <div className="md:col-span-2 text-sm text-gray-600">
                  Exemplos: 30 60 (30 e 60 dias), 0 (à vista), 6x (6 parcelas iguais), 0 2x (entrada mais 2 parcelas iguais)
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">R$</span>
                    <input
                      type="number"
                      value={value === 0 ? '' : value}
                      onChange={(e) => setValue(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full p-2 pl-10 border rounded-md"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Parcelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={parcelsCount}
                    onChange={(e) => handleParcelsCountChange(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    max="12"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {percentages.map((percentage, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parcela {index + 1} (%)
                      </label>
                      <input
                        type="number"
                        value={percentage}
                        onChange={(e) => handlePercentageChange(index, parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border rounded-md"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </div>
                  ))}
                </div>
                
                <div className={`mt-2 text-sm ${Math.abs(getTotalPercentage() - 100) > 0.01 ? 'text-red-500 font-bold' : 'text-green-500'}`}>
                  Total: {getTotalPercentage().toFixed(2)}% {Math.abs(getTotalPercentage() - 100) > 0.01 ? '(Deve ser 100%)' : '✓'}
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="prefilledReceivedValue"
                checked={prefilledReceivedValue}
                onChange={(e) => setPrefilledReceivedValue(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="prefilledReceivedValue" className="text-sm text-gray-700">
                Preencher valor recebido
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleGenerate}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UnifiedPurchasePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [nextNumber, setNextNumber] = useState('')
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  // Formulário principal
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    description: '',
    clientId: '',
    projectId: '',
    priority: 'MEDIUM',
    justification: '',
    neededByDate: '',
    comments: ''
  })

  // Itens da requisição
  const [items, setItems] = useState<PurchaseRequestItem[]>([])
  const [currentItem, setCurrentItem] = useState<PurchaseRequestItem>({
    description: '',
    quantity: 1,
    unit: 'un',
    estimatedPrice: null,
    justification: '',
    urgency: 'NORMAL'
  })

  // Parcelamento
  const [installments, setInstallments] = useState<Installment[]>([])
  const [currentInstallment, setCurrentInstallment] = useState<Installment>({
    account: '',
    paymentMethod: '',
    description: '',
    nfEmission: '',
    boleto: '',
    dueDate: '',
    netValue: null,
    grossValue: null,
    receivedValue: null
  })
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchClients()
      fetchProjects()
      fetchNextNumber()
    }
  }, [status, router])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
    }
  }

  const fetchNextNumber = async () => {
    try {
      const response = await fetch('/api/purchase-requests/next-number')
      if (response.ok) {
        const data = await response.json()
        setNextNumber(data.number)
        setFormData(prev => ({ ...prev, number: data.number }))
      }
    } catch (error) {
      console.error('Erro ao buscar próximo número:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? null : parseFloat(value)
    setFormData(prev => ({ ...prev, [name]: numValue }))
  }

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCurrentItem(prev => ({ ...prev, [name]: value }))
  }

  const handleItemNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let numValue: number | null = null
    
    if (value !== '') {
      numValue = name === 'quantity' ? parseFloat(value) : parseFloat(value)
    }
    
    setCurrentItem(prev => ({ ...prev, [name]: numValue }))
  }

  const addItem = () => {
    if (!currentItem.description || !currentItem.quantity || !currentItem.unit) {
      toast.error('Preencha os campos obrigatórios do item')
      return
    }

    setItems([...items, { ...currentItem }])
    setCurrentItem({
      description: '',
      quantity: 1,
      unit: 'un',
      estimatedPrice: null,
      justification: '',
      urgency: 'NORMAL'
    })
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.estimatedPrice ? item.quantity * item.estimatedPrice : 0)
    }, 0)
  }

  const addInstallment = () => {
    if (!currentInstallment.account || !currentInstallment.paymentMethod) {
      toast.error('Preencha os campos obrigatórios da parcela')
      return
    }

    setInstallments([...installments, { ...currentInstallment }])
    setCurrentInstallment({
      account: '',
      paymentMethod: '',
      description: '',
      nfEmission: '',
      boleto: '',
      dueDate: '',
      netValue: null,
      grossValue: null,
      receivedValue: null
    })
  }

  const removeInstallment = (index: number) => {
    const newInstallments = [...installments]
    newInstallments.splice(index, 1)
    setInstallments(newInstallments)
  }

  const handleInstallmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCurrentInstallment(prev => ({ ...prev, [name]: value }))
  }

  const handleInstallmentNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let numValue: number | null = null
    
    if (value !== '') {
      numValue = parseFloat(value)
    }
    
    setCurrentInstallment(prev => ({ ...prev, [name]: numValue }))
  }

  const calculateInstallmentsTotal = (field: 'netValue' | 'grossValue' | 'receivedValue') => {
    return installments.reduce((sum, item) => {
      return sum + (item[field] || 0)
    }, 0)
  }

  const handleSubmit = async () => {
    if (!formData.number || !formData.title) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um item ao pedido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          items,
          installments,
          budgetLimit: null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar requisição')
      }

      toast.success('Pedido criado com sucesso!')
      router.push('/dashboard/orders')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [...prev, newClient])
    setFormData(prev => ({ ...prev, clientId: newClient.id }))
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [...prev, newProject])
    setFormData(prev => ({ ...prev, projectId: newProject.id }))
  }

  const handleGenerateInstallments = (generatedInstallments: Installment[]) => {
    setInstallments(generatedInstallments)
    toast.success(`${generatedInstallments.length} parcelas geradas com sucesso!`)
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modais */}
      <ClientModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
      
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        selectedClientId={formData.clientId || undefined}
      />

      <GenerateInstallmentsModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateInstallments}
        totalValue={calculateTotal()}
      />
      
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Novo Pedido</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Número da requisição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Necessária
            </label>
            <div className="relative">
              <input
                type="date"
                name="neededByDate"
                value={formData.neededByDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título da requisição"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Cliente */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center text-xs"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Novo
              </button>
            </div>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.fantasyName}
                </option>
              ))}
            </select>
          </div>
          
          {/* Projeto */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Projeto
              </label>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(true)}
                disabled={!formData.clientId}
                className={`flex items-center text-xs ${
                  formData.clientId 
                    ? "text-blue-600 hover:text-blue-800" 
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                Novo
              </button>
            </div>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              {projects
                .filter(project => !formData.clientId || project.clientId === formData.clientId)
                .map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              }
            </select>
          </div>
          
          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
        </div>
        
        {/* Descrição/Justificativa */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição/Justificativa
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva o motivo desta requisição..."
          />
        </div>
      </div>

      {/* Seção de Itens */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Itens do Pedido</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={currentItem.description}
              onChange={handleItemInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrição do item"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantity"
              value={currentItem.quantity}
              onChange={handleItemNumberInput}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0.01"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade *
            </label>
            <select
              name="unit"
              value={currentItem.unit}
              onChange={handleItemInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="un">UN</option>
              <option value="kg">KG</option>
              <option value="m">M</option>
              <option value="m2">M²</option>
              <option value="m3">M³</option>
              <option value="l">L</option>
              <option value="pc">PC</option>
              <option value="cx">CX</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Est. Unit.
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">R$</span>
              <input
                type="number"
                name="estimatedPrice"
                value={currentItem.estimatedPrice === null ? '' : currentItem.estimatedPrice}
                onChange={handleItemNumberInput}
                className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0,00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={addItem}
              className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Tabela de itens */}
        {items.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Un.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Est. Unit.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.estimatedPrice 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.estimatedPrice)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.estimatedPrice 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.estimatedPrice)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td colSpan={4} className="px-6 py-4 text-right text-sm text-gray-700">
                    Total Estimado:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seção de Parcelamento */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Parcelamento</h2>
          <div className="flex flex-col items-end space-y-2">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Gerar Parcelas
            </button>
            <button
              type="button"
              onClick={addInstallment}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Parcela
            </button>
          </div>
        </div>
        
        {installments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conta
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emissão de NF
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boleto
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Líquido
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Bruto
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Recebido
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {installments.map((installment, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.account}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.paymentMethod}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.description}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.nfEmission}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.boleto}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.dueDate}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.netValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.netValue) : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.grossValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.grossValue) : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {installment.receivedValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.receivedValue) : '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeInstallment(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td colSpan={6} className="px-3 py-2 text-right text-sm text-gray-700">
                    Total:
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateInstallmentsTotal('netValue'))}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateInstallmentsTotal('grossValue'))}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateInstallmentsTotal('receivedValue'))}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conta
              </label>
              <select
                name="account"
                value={currentInstallment.account}
                onChange={handleInstallmentInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Banco">Banco</option>
                <option value="Caixa">Caixa</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                name="paymentMethod"
                value={currentInstallment.paymentMethod}
                onChange={handleInstallmentInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="Boleto">Boleto</option>
                <option value="PIX">PIX</option>
                <option value="Transferência">Transferência</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                name="description"
                value={currentInstallment.description}
                onChange={handleInstallmentInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição da parcela"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emissão da NF
              </label>
              <input
                type="date"
                name="nfEmission"
                value={currentInstallment.nfEmission}
                onChange={handleInstallmentInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Boleto
              </label>
              <input
                type="text"
                name="boleto"
                value={currentInstallment.boleto}
                onChange={handleInstallmentInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Número do boleto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vencimento
              </label>
              <input
                type="date"
                name="dueDate"
                value={currentInstallment.dueDate}
                onChange={handleInstallmentInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Líquido
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">R$</span>
                <input
                  type="number"
                  name="netValue"
                  value={currentInstallment.netValue === null ? '' : currentInstallment.netValue}
                  onChange={handleInstallmentNumberInput}
                  className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Bruto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">R$</span>
                <input
                  type="number"
                  name="grossValue"
                  value={currentInstallment.grossValue === null ? '' : currentInstallment.grossValue}
                  onChange={handleInstallmentNumberInput}
                  className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Recebido
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">R$</span>
                <input
                  type="number"
                  name="receivedValue"
                  value={currentInstallment.receivedValue === null ? '' : currentInstallment.receivedValue}
                  onChange={handleInstallmentNumberInput}
                  className="w-full p-2 pl-10 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end mt-6 space-x-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 rounded-md text-white hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading ? 'Salvando...' : (
            <>
              <Save className="h-5 w-5 mr-1" />
              Salvar Pedido
            </>
          )}
        </button>
      </div>
    </div>
  )
} 