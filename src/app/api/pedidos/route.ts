import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const pedidos = await prisma.purchase.findMany({
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

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const pedido = await prisma.purchase.create({
      data: {
        number: data.number.toString(),
        cnpj: data.cnpj,
        clientId: data.clientId,
        projectId: data.projectId,
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
            account: installment.account,
            paymentMethod: installment.paymentMethod,
            description: installment.description,
            dueDate: new Date(installment.dueDate),
            grossValue: installment.grossValue,
            netValue: installment.netValue
          }))
        }
      },
      include: {
        client: true,
        project: true,
        items: true,
        services: true,
        installments: true
      }
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
} 