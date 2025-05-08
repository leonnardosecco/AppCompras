'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { X, Search } from 'lucide-react'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientCreated: (client: any) => void
}

export default function ClientModal({ isOpen, onClose, onClientCreated }: ClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false)
  const [formData, setFormData] = useState({
    fantasyName: '',
    companyName: '',
    document: '',
    type: 'PJ',
    municipalRegistration: '',
    stateRegistration: '',
    email: '',
    phone: '',
    pix: '',
    observations: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatDocument = (doc: string) => {
    // Remove tudo que não é número
    return doc.replace(/\D/g, '')
  }

  const fetchCnpjData = async () => {
    const formattedDocument = formatDocument(formData.document)
    
    if (formData.type !== 'PJ' || formattedDocument.length !== 14) {
      toast.error('CNPJ inválido ou não é pessoa jurídica')
      return
    }

    setIsFetchingCnpj(true)

    try {
      const response = await fetch(`/api/cnpj/${formattedDocument}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao consultar CNPJ')
      }

      const data = await response.json()
      
      setFormData(prev => ({
        ...prev,
        fantasyName: data.tradeName || '',
        companyName: data.name || '',
        email: data.email || prev.email,
        phone: data.phone || prev.phone
      }))

      toast.success('Dados do CNPJ carregados com sucesso')
    } catch (error) {
      console.error('Erro ao buscar dados do CNPJ:', error)
      toast.error('Falha ao buscar dados do CNPJ')
    } finally {
      setIsFetchingCnpj(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fantasyName) {
      toast.error('Nome Fantasia é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar cliente')
      }

      const newClient = await response.json()
      toast.success('Cliente criado com sucesso!')
      onClientCreated(newClient)
      onClose()
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      toast.error('Falha ao criar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Novo Cliente</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Fantasia *
              </label>
              <input
                type="text"
                name="fantasyName"
                value={formData.fantasyName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ/CPF
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-l-md"
                />
                <button 
                  type="button"
                  onClick={fetchCnpjData}
                  disabled={isFetchingCnpj}
                  className="px-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isFetchingCnpj ? (
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="PJ">Pessoa Jurídica</option>
                <option value="PF">Pessoa Física</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Municipal
              </label>
              <input
                type="text"
                name="municipalRegistration"
                value={formData.municipalRegistration}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Estadual
              </label>
              <input
                type="text"
                name="stateRegistration"
                value={formData.stateRegistration}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIX
              </label>
              <input
                type="text"
                name="pix"
                value={formData.pix}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 