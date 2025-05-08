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
    const active = searchParams.get('active') === 'true'
    
    const filter = active ? { isActive: true } : {}

    const clients = await prisma.client.findMany({
      where: filter,
      orderBy: { fantasyName: 'asc' },
      select: {
        id: true,
        fantasyName: true,
        companyName: true,
        document: true,
        isActive: true
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()

    const client = await prisma.client.create({
      data: {
        fantasyName: data.fantasyName,
        companyName: data.companyName,
        municipalRegistration: data.municipalRegistration,
        stateRegistration: data.stateRegistration,
        type: data.type,
        document: data.document,
        email: data.email,
        phone: data.phone,
        pix: data.pix,
        observations: data.observations,
        isActive: data.isActive
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
} 