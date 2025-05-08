import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface Service {
  service: string
  description?: string
  price: number
  quantity: number
  discount: number
  total: number
}

interface Installment {
  account: string
  paymentMethod: string
  description: string
  nfEmission?: Date
  dueDate: Date
  netValue: number
  grossValue: number
}

interface PurchaseData {
  number: number
  date: string
  company: string
  clientId?: string
  projectId?: string
  observations?: string
  services: Service[]
  hasWithholdingTax: boolean
  withholdingTaxValue: number
  installments: Installment[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')

    // Construir o filtro baseado nos parâmetros
    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (projectId) where.projectId = projectId

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        client: true,
        project: true,
        items: true,
        services: true,
        installments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Erro ao buscar compras:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar compras' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Criar a compra com seus relacionamentos
    const purchase = await prisma.purchase.create({
      data: {
        number: data.number,
        clientId: data.clientId,
        projectId: data.projectId,
        totalValue: data.totalValue,
        items: {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        },
        services: {
          create: data.services.map((service: any) => ({
            description: service.description,
            value: service.value,
            inssRetention: service.inssRetention,
            issRetention: service.issRetention,
            irRetention: service.irRetention,
            netValue: service.netValue
          }))
        },
        installments: {
          create: data.installments.map((installment: any) => ({
            number: installment.number,
            dueDate: new Date(installment.dueDate),
            value: installment.value
          }))
        }
      },
      include: {
        items: true,
        services: true,
        installments: true
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Erro ao criar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao criar compra' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        ...updateData,
        items: {
          deleteMany: {},
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        },
        services: {
          deleteMany: {},
          create: data.services.map((service: any) => ({
            description: service.description,
            value: service.value,
            inssRetention: service.inssRetention,
            issRetention: service.issRetention,
            irRetention: service.irRetention,
            netValue: service.netValue
          }))
        },
        installments: {
          deleteMany: {},
          create: data.installments.map((installment: any) => ({
            number: installment.number,
            dueDate: new Date(installment.dueDate),
            value: installment.value
          }))
        }
      },
      include: {
        items: true,
        services: true,
        installments: true
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Erro ao atualizar compra:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar compra' },
      { status: 500 }
    )
  }
} 