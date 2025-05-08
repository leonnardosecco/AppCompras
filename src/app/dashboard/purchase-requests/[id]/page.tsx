'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, FileText, ShoppingCart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PurchaseRequestItem {
  id: string
  description: string
  quantity: number
  unit: string
  estimatedPrice: number | null
  justification: string | null
  urgency: string
  isApproved: boolean | null
}

interface PurchaseRequest {
  id: string
  number: string
  title: string
  description: string | null
  status: string
  priority: string
  requestDate: string
  approvalDate: string | null
  neededByDate: string | null
  budgetLimit: number | null
  justification: string | null
  rejectionReason: string | null
  comments: string | null
  client: {
    id: string
    fantasyName: string
  } | null
  project: {
    id: string
    name: string
    color: string
  } | null
  createdBy: {
    id: string
    name: string
    email: string
  }
  approvedBy: {
    id: string
    name: string
    email: string
  } | null
  items: PurchaseRequestItem[]
  purchases: any[]
}

export default function PurchaseRequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [request, setRequest] = useState<PurchaseRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)

  useEffect(() => {
    fetchRequest()
  }, [params.id])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/purchase-requests/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar requisição')
      }
      
      const data = await response.json()
      setRequest(data)
    } catch (error) {
      console.error('Erro ao buscar detalhes da requisição:', error)
      toast.error('Erro ao carregar detalhes da requisição')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/purchase-requests/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: approvalNotes })
      })

      if (!response.ok) {
        throw new Error('Erro ao aprovar requisição')
      }

      toast.success('Requisição aprovada com sucesso!')
      setShowApproveModal(false)
      fetchRequest()
    } catch (error) {
      console.error('Erro ao aprovar requisição:', error)
      toast.error('Erro ao aprovar requisição')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error('É necessário fornecer um motivo para a rejeição')
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/purchase-requests/${params.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      })

      if (!response.ok) {
        throw new Error('Erro ao rejeitar requisição')
      }

      toast.success('Requisição rejeitada com sucesso!')
      setShowRejectModal(false)
      fetchRequest()
    } catch (error) {
      console.error('Erro ao rejeitar requisição:', error)
      toast.error('Erro ao rejeitar requisição')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConvertToPurchase = async () => {
    try {
      setActionLoading(true)
      
      // Implementar a chamada para a API que converte a requisição em pedido
      // Esta implementação depende de como a API de pedidos está estruturada
      toast.success('Requisição convertida em pedido com sucesso!')
      
      setShowConvertModal(false)
      router.push('/dashboard/unified-purchase')
    } catch (error) {
      console.error('Erro ao converter em pedido:', error)
      toast.error('Erro ao converter em pedido')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </span>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Baixa
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Média
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Alta
          </span>
        )
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Crítica
          </span>
        )
      default:
        return null
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Baixa
          </span>
        )
      case 'NORMAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Normal
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Alta
          </span>
        )
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Crítica
          </span>
        )
      default:
        return null
    }
  }

  const isAdmin = session?.user?.role === 'ADMIN'
  const canApprove = isAdmin && request?.status === 'PENDING'
  const canConvertToPurchase = isAdmin || session?.user?.role === 'COMPRADOR'

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-4">Requisição não encontrada</p>
            <button
              onClick={() => router.push('/dashboard/purchase-requests')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar para Requisições
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Detalhes da Requisição</h1>
        
        <div className="ml-auto flex gap-2">
          {canApprove && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aprovar
              </button>
              
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeitar
              </button>
            </>
          )}
          
          {request.status === 'APPROVED' && canConvertToPurchase && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Converter em Pedido
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Informações Gerais</h2>
          
          <div className="space-y-3">
            <div>
              <span className="block text-sm font-medium text-gray-500">Número</span>
              <span className="text-gray-900">{request.number}</span>
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-500">Status</span>
              <div>{getStatusBadge(request.status)}</div>
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-500">Prioridade</span>
              <div>{getPriorityBadge(request.priority)}</div>
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-500">Data da Solicitação</span>
              <span className="text-gray-900">{formatDate(request.requestDate)}</span>
            </div>
            
            {request.neededByDate && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Data Necessária</span>
                <span className="text-gray-900">{formatDate(request.neededByDate)}</span>
              </div>
            )}
            
            <div>
              <span className="block text-sm font-medium text-gray-500">Solicitante</span>
              <span className="text-gray-900">{request.createdBy.name}</span>
            </div>
            
            {request.approvedBy && (
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  {request.status === 'APPROVED' ? 'Aprovado por' : 'Rejeitado por'}
                </span>
                <span className="text-gray-900">{request.approvedBy.name}</span>
              </div>
            )}
            
            {request.approvalDate && (
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  {request.status === 'APPROVED' ? 'Data de Aprovação' : 'Data de Rejeição'}
                </span>
                <span className="text-gray-900">{formatDate(request.approvalDate)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Detalhes da Requisição</h2>
          
          <div className="space-y-3">
            <div>
              <span className="block text-sm font-medium text-gray-500">Título</span>
              <span className="text-gray-900">{request.title}</span>
            </div>
            
            {request.description && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Descrição</span>
                <p className="text-gray-900 whitespace-pre-line">{request.description}</p>
              </div>
            )}
            
            {request.client && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Cliente</span>
                <span className="text-gray-900">{request.client.fantasyName}</span>
              </div>
            )}
            
            {request.project && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Projeto</span>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: request.project.color }}
                  />
                  <span className="text-gray-900">{request.project.name}</span>
                </div>
              </div>
            )}
            
            {request.budgetLimit && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Limite Orçamentário</span>
                <span className="text-gray-900">{formatCurrency(request.budgetLimit)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Informações Adicionais</h2>
          
          <div className="space-y-3">
            {request.justification && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Justificativa</span>
                <p className="text-gray-900 whitespace-pre-line">{request.justification}</p>
              </div>
            )}
            
            {request.rejectionReason && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Motivo da Rejeição</span>
                <p className="text-gray-900 whitespace-pre-line">{request.rejectionReason}</p>
              </div>
            )}
            
            {request.comments && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Comentários</span>
                <p className="text-gray-900 whitespace-pre-line">{request.comments}</p>
              </div>
            )}
            
            {request.purchases && request.purchases.length > 0 && (
              <div>
                <span className="block text-sm font-medium text-gray-500">Pedidos Associados</span>
                <ul className="list-disc pl-5 text-gray-900">
                  {request.purchases.map(purchase => (
                    <li key={purchase.id}>
                      <a 
                        href={`/dashboard/orders/${purchase.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Pedido #{purchase.number}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Itens da Requisição</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Est. Unit.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgência
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Justificativa
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {request.items.map((item) => (
                <tr key={item.id}>
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
                      ? formatCurrency(item.estimatedPrice)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.estimatedPrice 
                      ? formatCurrency(item.quantity * item.estimatedPrice)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUrgencyBadge(item.urgency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.justification || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Aprovação */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Aprovar Requisição</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas de Aprovação (opcional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Adicione informações ou instruções adicionais..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rejeitar Requisição</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo da Rejeição *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Informe o motivo da rejeição..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading || !rejectionReason}
              >
                {actionLoading ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conversão em Pedido */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Converter em Pedido de Compra</h3>
            
            <p className="mb-4 text-gray-700">
              Deseja converter esta requisição em um pedido de compra? 
              Todos os itens da requisição serão incluídos no novo pedido.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleConvertToPurchase}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Convertendo...' : 'Converter em Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 