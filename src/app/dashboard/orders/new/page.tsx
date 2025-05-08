'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BackButton } from '@/app/components/BackButton'

interface Item {
  nome: string
  valor: number
  unidade: string
  observacao?: string
}

export default function NewOrderPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [items, setItems] = useState<Item[]>([])
  const [currentItem, setCurrentItem] = useState<Item>({
    nome: '',
    valor: 0,
    unidade: '',
    observacao: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddItem = () => {
    if (!currentItem.nome || !currentItem.valor || !currentItem.unidade) {
      setError('Preencha os campos obrigatórios')
      return
    }

    setItems([...items, currentItem])
    setCurrentItem({
      nome: '',
      valor: 0,
      unidade: '',
      observacao: ''
    })
    setError('')
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Adicione pelo menos um item ao pedido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar pedido')
      }

      router.push('/dashboard')
    } catch (error) {
      setError('Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleClearForm = () => {
    setCurrentItem({
      nome: '',
      valor: 0,
      unidade: '',
      observacao: ''
    })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <BackButton href="/dashboard/orders" />
        <h1 className="text-2xl font-bold mb-6">Novo Pedido</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item *
              </label>
              <input
                type="text"
                value={currentItem.nome}
                onChange={(e) => setCurrentItem({ ...currentItem, nome: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nome ou descrição do item"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Unitário *
              </label>
              <input
                type="number"
                value={currentItem.valor}
                onChange={(e) => setCurrentItem({ ...currentItem, valor: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="R$ 0,00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade *
              </label>
              <select
                value={currentItem.unidade}
                onChange={(e) => setCurrentItem({ ...currentItem, unidade: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Selecione...</option>
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="pc">Pacote (pc)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <input
                type="text"
                value={currentItem.observacao}
                onChange={(e) => setCurrentItem({ ...currentItem, observacao: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Observações adicionais"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClearForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpar Campos
            </button>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Adicionar ao Pedido
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Itens do Pedido</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Finalizar Pedido'}
          </button>
        </div>
      </div>
    </div>
  )
} 