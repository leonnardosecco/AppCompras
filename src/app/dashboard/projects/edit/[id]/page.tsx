'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Client {
  id: string
  fantasyName: string
}

interface ProjectFormData {
  name: string
  clientId: string
  color: string
  isActive: boolean
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [loading, setLoading] = useState(false)
  const [loadingProject, setLoadingProject] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    clientId: '',
    color: '#0000FF',
    isActive: true
  })

  const colors = [
    '#0000FF', '#4169E1', '#87CEEB', '#00CED1', '#98FB98', '#FFD700',
    '#90EE90', '#98FB98', '#32CD32', '#008000', '#FFA500', '#FF4500',
    '#FF0000', '#FF69B4', '#8B4513', '#A0522D', '#000000', '#808080',
    '#C0C0C0', '#FFFFFF', '#00FFFF', '#FF00FF', '#800080', '#4B0082'
  ]

  useEffect(() => {
    // Buscar dados do projeto e lista de clientes
    fetchProject()
    fetchClients()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoadingProject(true)
      const response = await fetch(`/api/projects/${id}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do projeto')
      }
      
      const project = await response.json()
      setFormData({
        name: project.name,
        clientId: project.clientId || '',
        color: project.color,
        isActive: project.isActive
      })
    } catch (error) {
      console.error('Erro ao buscar projeto:', error)
      toast.error('Erro ao carregar projeto')
    } finally {
      setLoadingProject(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes')
      }
      
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      toast.error('Erro ao carregar lista de clientes')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar projeto')
      }

      toast.success('Projeto atualizado com sucesso!')
      router.push('/dashboard/projects')
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
      toast.error('Erro ao atualizar projeto')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/projects')
  }

  if (loadingProject) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Projetos
        </button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Projeto</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fantasyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <div className="grid grid-cols-12 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ativo
              </label>
              <div className="h-[42px] flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 