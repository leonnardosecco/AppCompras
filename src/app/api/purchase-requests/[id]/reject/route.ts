import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Rejeitar uma requisição de compra
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se é admin (só admins podem rejeitar)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem rejeitar requisições' },
        { status: 403 }
      )
    }

    const { id } = params
    const data = await request.json()
    const { reason } = data

    if (!reason) {
      return NextResponse.json(
        { error: 'É necessário fornecer um motivo para a rejeição' },
        { status: 400 }
      )
    }

    // Verificar se a requisição existe
    const existingRequest = await prisma.purchaseRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Requisição de compra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já está aprovada ou rejeitada
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta requisição já foi processada anteriormente' },
        { status: 400 }
      )
    }

    // Rejeitar a requisição
    const rejectedRequest = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: session.user.id,
        approvalDate: new Date(),
        rejectionReason: reason,
        comments: `${existingRequest.comments || ''}\n\nMotivo da rejeição: ${reason}`
      },
      include: {
        client: true,
        project: true,
        items: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(rejectedRequest)
  } catch (error) {
    console.error('Erro ao rejeitar requisição de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao rejeitar requisição de compra' },
      { status: 500 }
    )
  }
} 