import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Buscar projeto por ID
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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            fantasyName: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projeto' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar projeto
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

    // Verificar se o projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar projeto com os dados recebidos
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        clientId: data.clientId || null,
        isActive: data.isActive,
        ...(data.color && { color: data.color }),
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir projeto
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

    // Verificar se o projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o projeto está associado a compras ou vendas
    const purchaseCount = await prisma.purchase.count({
      where: { projectId: id }
    })

    // Verificar se há vendas de serviço associadas ao projeto
    const serviceSalesCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "ServiceSale" 
      WHERE "projectId" = ${id}
    `
    
    // Verificar se tem associações
    const hasAssociations = purchaseCount > 0 || 
                          (Array.isArray(serviceSalesCount) && 
                           serviceSalesCount.length > 0 && 
                           serviceSalesCount[0].count > 0)

    if (hasAssociations) {
      return NextResponse.json(
        { error: 'Este projeto não pode ser excluído pois está associado a compras ou vendas' },
        { status: 400 }
      )
    }

    // Excluir projeto
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir projeto' },
      { status: 500 }
    )
  }
} 