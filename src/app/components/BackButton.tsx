'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      Voltar
    </button>
  )
} 