import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'

interface Client {
  id: string
  name: string
  cnpj: string
  fantasyName: string
}

interface ClientSelectProps {
  onSelect: (client: Client) => void
}

export function ClientSelect({ onSelect }: ClientSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState({
    fantasyName: '',
    cnpj: '',
    name: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  const handleCNPJChange = async (cnpj: string) => {
    setNewClient({ ...newClient, cnpj })
    if (cnpj.length === 14) {
      try {
        const response = await fetch(`/api/cnpj/${cnpj}`)
        const data = await response.json()
        setNewClient({
          ...newClient,
          cnpj,
          name: data.razao_social,
          fantasyName: data.nome_fantasia
        })
      } catch (error) {
        console.error('Erro ao buscar CNPJ:', error)
      }
    }
  }

  const handleCreateClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      })
      const data = await response.json()
      setClients([...clients, data])
      onSelect(data)
      setShowNewClientForm(false)
      setNewClient({ fantasyName: '', cnpj: '', name: '' })
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    }
  }

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.fantasyName.toLowerCase().includes(search.toLowerCase()) ||
    client.cnpj.includes(search)
  )

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={() => setShowNewClientForm(true)}
          className="px-3 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isOpen && filteredClients.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => {
                onSelect(client)
                setIsOpen(false)
                setSearch('')
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
            >
              <div className="text-sm font-medium text-gray-900">{client.fantasyName}</div>
              <div className="text-sm text-gray-500">{client.cnpj}</div>
            </button>
          ))}
        </div>
      )}

      {showNewClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Novo Cliente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={newClient.cnpj}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={newClient.fantasyName}
                  onChange={(e) => setNewClient({ ...newClient, fantasyName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewClientForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateClient}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 