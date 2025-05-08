import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar requisição de compra por ID
export async function GET(
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

    const { id } = params

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true,
        purchases: {
          include: {
            items: true
          }
        }
      }
    })

    if (!purchaseRequest) {
      return NextResponse.json(
        { error: 'Requisição de compra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem acesso
    if (
      session.user.role !== 'ADMIN' &&
      purchaseRequest.createdById !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Acesso negado a esta requisição' },
        { status: 403 }
      )
    }

    return NextResponse.json(purchaseRequest)
  } catch (error) {
    console.error('Erro ao buscar requisição de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar requisição de compra' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar requisição de compra
export async function PUT(
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

    const { id } = params
    const data = await request.json()

    // Verificar se a requisição existe
    const existingRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Requisição de compra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = existingRequest.createdById === session.user.id
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar esta requisição' },
        { status: 403 }
      )
    }

    // Não permitir edição se já aprovada ou rejeitada (a menos que seja admin)
    if (!isAdmin && existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Não é possível editar uma requisição que já foi processada' },
        { status: 400 }
      )
    }

    // Preparar dados de atualização
    const updateData: any = {
      title: data.title,
      description: data.description,
      clientId: data.clientId || null,
      projectId: data.projectId || null,
      priority: data.priority,
      justification: data.justification,
      neededByDate: data.neededByDate ? new Date(data.neededByDate) : null,
      budgetLimit: data.budgetLimit || null,
      comments: data.comments
    }

    // Transação para atualizar requisição e itens
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // 1. Atualizar requisição
      const updated = await tx.purchaseRequest.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          project: true,
          items: true,
          createdBy: {
            select: {
              name: true
            }
          },
          approvedBy: {
            select: {
              name: true
            }
          }
        }
      })

      // 2. Atualizar ou criar novos itens, se houver
      if (Array.isArray(data.items)) {
        // Deletar todos os itens existentes
        await tx.purchaseRequestItem.deleteMany({
          where: { purchaseRequestId: id }
        })

        // Criar novos itens
        await Promise.all(
          data.items.map((item: any) =>
            tx.purchaseRequestItem.create({
              data: {
                purchaseRequestId: id,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                estimatedPrice: item.estimatedPrice || null,
                justification: item.justification || null,
                urgency: item.urgency || 'NORMAL'
              }
            })
          )
        )
      }

      // Buscar novamente com os itens atualizados
      return tx.purchaseRequest.findUnique({
        where: { id },
        include: {
          client: true,
          project: true,
          items: true,
          createdBy: {
            select: {
              name: true
            }
          },
          approvedBy: {
            select: {
              name: true
            }
          }
        }
      })
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Erro ao atualizar requisição de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar requisição de compra' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir requisição de compra
export async function DELETE(
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

    const { id } = params

    // Verificar se a requisição existe
    const existingRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: { purchases: true }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Requisição de compra não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = existingRequest.createdById === session.user.id
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir esta requisição' },
        { status: 403 }
      )
    }

    // Verificar se já há compras associadas
    if (existingRequest.purchases.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma requisição que possui compras associadas' },
        { status: 400 }
      )
    }

    // Não permitir exclusão se já aprovada (a menos que seja admin)
    if (!isAdmin && existingRequest.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Não é possível excluir uma requisição que já foi aprovada' },
        { status: 400 }
      )
    }

    // Excluir requisição
    await prisma.purchaseRequest.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir requisição de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir requisição de compra' },
      { status: 500 }
    )
  }
} 