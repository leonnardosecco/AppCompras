import { useState } from 'react'
import { Calculator } from 'lucide-react'

interface AutomaticInstallmentsProps {
  totalAmount: number
  onGenerate: (installments: Array<{
    account: string
    paymentMethod: string
    description: string
    dueDate: Date
    netValue: number
    grossValue: number
  }>) => void
}

export function AutomaticInstallments({ totalAmount, onGenerate }: AutomaticInstallmentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [numberOfInstallments, setNumberOfInstallments] = useState(1)
  const [firstDueDate, setFirstDueDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  )
  const [account, setAccount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  const handleGenerate = () => {
    const installmentValue = totalAmount / numberOfInstallments
    const installments = []

    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(firstDueDate)
      dueDate.setMonth(dueDate.getMonth() + i)

      installments.push({
        account,
        paymentMethod,
        description: `Parcela ${i + 1} de ${numberOfInstallments}`,
        dueDate,
        netValue: installmentValue,
        grossValue: installmentValue
      })
    }

    onGenerate(installments)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
      >
        <Calculator className="h-5 w-5" />
        Parcelamento Automático
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Parcelamento Automático</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Parcelas
            </label>
            <input
              type="number"
              min="1"
              value={numberOfInstallments}
              onChange={(e) => setNumberOfInstallments(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primeira Data de Vencimento
            </label>
            <input
              type="date"
              value={firstDueDate}
              onChange={(e) => setFirstDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de Pagamento
            </label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>Valor total: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p>Valor por parcela: {(totalAmount / numberOfInstallments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Gerar Parcelas
          </button>
        </div>
      </div>
    </div>
  )
} 