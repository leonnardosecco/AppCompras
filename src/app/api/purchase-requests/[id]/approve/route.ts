import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Aprovar uma requisição de compra
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

    // Verificar se é admin (só admins podem aprovar)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem aprovar requisições' },
        { status: 403 }
      )
    }

    const { id } = params
    const data = await request.json()
    const { notes } = data

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

    // Aprovar a requisição
    const approvedRequest = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: session.user.id,
        approvalDate: new Date(),
        comments: notes ? `${existingRequest.comments || ''}\n\nNotas de aprovação: ${notes}` : existingRequest.comments
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

    return NextResponse.json(approvedRequest)
  } catch (error) {
    console.error('Erro ao aprovar requisição de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao aprovar requisição de compra' },
      { status: 500 }
    )
  }
} 