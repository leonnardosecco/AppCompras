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
    const clientId = searchParams.get('clientId')
    const active = searchParams.get('active') === 'true'

    // Montar o filtro baseado nos parâmetros
    const filter: any = {}
    if (clientId) filter.clientId = clientId
    if (active) filter.isActive = true

    const projects = await prisma.project.findMany({
      where: filter,
      orderBy: { name: 'asc' },
      include: {
        client: {
          select: {
            fantasyName: true
          }
        }
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
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

    const project = await prisma.project.create({
      data: {
        name: data.name,
        clientId: data.clientId,
        color: data.color,
        isActive: data.isActive
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json({ error: 'Erro ao criar projeto' }, { status: 500 })
  }
} 