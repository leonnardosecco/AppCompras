'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (session?.user?.role) {
      case 'ADMIN':
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Painel do Administrador</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="Gerenciar Usuários"
                description="Adicionar, editar e remover usuários do sistema"
                link="/dashboard/users"
              />
              <DashboardCard
                title="Pedidos de Compra"
                description="Visualizar e gerenciar pedidos"
                link="/dashboard/orders"
              />
              <DashboardCard
                title="Requisições de Compra"
                description="Gerenciar requisições e aprovações"
                link="/dashboard/purchase-requests"
              />
            </div>
          </div>
        )
      case 'COMPRADOR':
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Painel do Comprador</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardCard
                title="Requisições de Compra"
                description="Criar e gerenciar requisições de compra"
                link="/dashboard/purchase-requests"
              />
              <DashboardCard
                title="Meus Pedidos"
                description="Gerenciar pedidos existentes e criar novos"
                link="/dashboard/orders"
                highlighted={true}
              />
            </div>
          </div>
        )
      case 'ESTOQUISTA':
        return (
          <div>
            <h1 className="text-2xl font-bold mb-4">Painel do Estoquista</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardCard
                title="Requisições de Compra"
                description="Visualizar requisições"
                link="/dashboard/purchase-requests"
              />
            </div>
          </div>
        )
      default:
        return <p>Acesso não autorizado</p>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Sistema de Compras</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Olá, {session?.user?.name}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  )
}

function DashboardCard({ title, description, link, highlighted = false }: {
  title: string
  description: string
  link: string
  highlighted?: boolean
}) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(link)}
      className={`${
        highlighted 
          ? 'bg-blue-50 border-blue-200 shadow-lg' 
          : 'bg-white border-transparent'
      } p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2`}
    >
      <h2 className={`text-lg font-semibold mb-2 ${highlighted ? 'text-blue-700' : ''}`}>{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  )
} 