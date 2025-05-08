import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const { id } = params

    // Não permitir excluir o próprio usuário
    if (session.user.id === id) {
      return new NextResponse('Não é possível excluir o próprio usuário', { status: 400 })
    }

    // Verificar se é o último admin
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    })

    if (user?.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      })

      if (adminCount <= 1) {
        return new NextResponse('Não é possível excluir o último administrador', { status: 400 })
      }
    }

    await prisma.user.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return new NextResponse('Erro interno do servidor', { status: 500 })
  }
} 