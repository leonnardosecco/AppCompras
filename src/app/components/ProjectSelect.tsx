import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'

interface Project {
  id: string
  name: string
  clientId: string
  color?: string
}

interface ProjectSelectProps {
  clientId?: string
  onSelect: (project: Project) => void
}

export function ProjectSelect({ clientId, onSelect }: ProjectSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    color: '#3B82F6', // Azul padrão
    clientId: clientId || ''
  })

  useEffect(() => {
    if (clientId) {
      fetchProjects()
    }
  }, [clientId])

  const fetchProjects = async () => {
    try {
      const url = clientId ? `/api/projects?clientId=${clientId}` : '/api/projects'
      const response = await fetch(url)
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
    }
  }

  const handleCreateProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      })
      const data = await response.json()
      setProjects([...projects, data])
      onSelect(data)
      setShowNewProjectForm(false)
      setNewProject({ name: '', color: '#3B82F6', clientId: clientId || '' })
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
    }
  }

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(search.toLowerCase())
  )

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#DC2626'
  ]

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={() => setShowNewProjectForm(true)}
          className="px-3 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isOpen && filteredProjects.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => {
                onSelect(project)
                setIsOpen(false)
                setSearch('')
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none flex items-center"
            >
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-sm font-medium text-gray-900">{project.name}</span>
            </button>
          ))}
        </div>
      )}

      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Novo Projeto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`w-8 h-8 rounded-full ${newProject.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewProjectForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
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