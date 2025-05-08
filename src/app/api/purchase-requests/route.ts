import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todas as requisições de compra
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter parâmetros de consulta
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const userId = url.searchParams.get('userId')
    const clientId = url.searchParams.get('clientId')
    const projectId = url.searchParams.get('projectId')

    // Construir filtro
    const filter: any = {}

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    if (userId) {
      filter.createdById = userId
    }

    if (clientId) {
      filter.clientId = clientId
    }

    if (projectId) {
      filter.projectId = projectId
    }

    // Verificar o papel do usuário
    if (session.user.role !== 'ADMIN') {
      // Se não for admin, só pode ver suas próprias requisições
      filter.createdById = session.user.id
    }

    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: filter,
      include: {
        client: {
          select: {
            fantasyName: true
          }
        },
        project: {
          select: {
            name: true,
            color: true
          }
        },
        createdBy: {
          select: {
            name: true
          }
        },
        approvedBy: {
          select: {
            name: true
          }
        },
        items: true
      },
      orderBy: {
        requestDate: 'desc'
      }
    })

    return NextResponse.json(purchaseRequests)
  } catch (error) {
    console.error('Erro ao buscar requisições de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar requisições de compra' },
      { status: 500 }
    )
  }
}

// POST - Criar uma nova requisição de compra
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validar dados obrigatórios
    if (!data.title) {
      return NextResponse.json(
        { error: 'O título é obrigatório' },
        { status: 400 }
      )
    }

    if (!data.number) {
      return NextResponse.json(
        { error: 'O número da requisição é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o número já existe
    const existingRequest = await prisma.purchaseRequest.findUnique({
      where: { number: data.number }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Já existe uma requisição com este número' },
        { status: 400 }
      )
    }

    // Criar a requisição
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        number: data.number,
        title: data.title,
        description: data.description,
        clientId: data.clientId || null,
        projectId: data.projectId || null,
        status: 'PENDING',
        priority: data.priority || 'MEDIUM',
        justification: data.justification,
        neededByDate: data.neededByDate ? new Date(data.neededByDate) : null,
        budgetLimit: data.budgetLimit || null,
        createdById: session.user.id,
        comments: data.comments,
        items: {
          create: Array.isArray(data.items) ? data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedPrice: item.estimatedPrice || null,
            justification: item.justification,
            urgency: item.urgency || 'NORMAL'
          })) : []
        }
      },
      include: {
        client: true,
        project: true,
        items: true,
        createdBy: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(purchaseRequest)
  } catch (error) {
    console.error('Erro ao criar requisição de compra:', error)
    return NextResponse.json(
      { error: 'Erro ao criar requisição de compra' },
      { status: 500 }
    )
  }
} 