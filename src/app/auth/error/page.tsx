'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  let errorMessage = 'Ocorreu um erro durante a autenticação'

  if (error === 'CredentialsSignin') {
    errorMessage = 'Email ou senha inválidos'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[480px] bg-white rounded-3xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erro de autenticação
          </h2>
          <div className="text-red-500 mb-6">
            {errorMessage}
          </div>
          <Link 
            href="/"
            className="w-full py-3 px-4 bg-blue-600 text-white text-center text-base font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Voltar para a página de login
          </Link>
        </div>
      </div>
    </div>
  )
} 