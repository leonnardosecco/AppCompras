import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Regenerar o cliente Prisma após alterações no schema
    await prisma.$connect()
    
    const serviceSales = await prisma.$queryRaw`
      SELECT 
        s.id, s.number, s.date, s.client_id as "clientId", s.project_id as "projectId", 
        s.total_value as "totalValue", c.fantasy_name as "clientName", p.name as "projectName"
      FROM "ServiceSale" s
      LEFT JOIN "Client" c ON s.client_id = c.id
      LEFT JOIN "Project" p ON s.project_id = p.id
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `

    return NextResponse.json(serviceSales)
  } catch (error) {
    console.error('Erro ao buscar vendas de serviços:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vendas de serviços' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

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

    // Validar dados necessários
    if (!data.number) {
      return NextResponse.json(
        { error: 'Número da venda é obrigatório' },
        { status: 400 }
      )
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos um serviço deve ser adicionado' },
        { status: 400 }
      )
    }

    if (!data.installments || data.installments.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma parcela deve ser adicionada' },
        { status: 400 }
      )
    }

    // Verificar se já existe venda com o mesmo número
    const existingSale = await prisma.serviceSale.findUnique({
      where: { number: data.number }
    })

    if (existingSale) {
      return NextResponse.json(
        { error: 'Já existe uma venda com este número' },
        { status: 400 }
      )
    }

    // Criar venda de serviço com itens e parcelas
    const serviceSale = await prisma.serviceSale.create({
      data: {
        number: data.number,
        date: new Date(data.date),
        clientId: data.clientId || null,
        projectId: data.projectId || null,
        observations: data.observations,
        taxRetention: data.taxRetention,
        taxValue: data.taxValue,
        totalValue: data.totalValue,
        receivableValue: data.receivableValue,
        items: {
          create: data.items.map((item: any) => ({
            serviceType: item.serviceType,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount,
            total: item.total
          }))
        },
        installments: {
          create: data.installments.map((installment: any) => ({
            number: installment.number,
            account: installment.account,
            paymentMethod: installment.paymentMethod,
            description: installment.description,
            nfEmission: installment.nfEmission ? new Date(installment.nfEmission) : null,
            dueDate: new Date(installment.dueDate),
            receipt: installment.receipt ? new Date(installment.receipt) : null,
            grossValue: installment.grossValue,
            netValue: installment.netValue,
            receivedValue: installment.receivedValue || null
          }))
        }
      }
    })

    return NextResponse.json(serviceSale)
  } catch (error) {
    console.error('Erro ao criar venda de serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao criar venda de serviço' },
      { status: 500 }
    )
  }
} 