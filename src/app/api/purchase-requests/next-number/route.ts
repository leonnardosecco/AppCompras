import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obter o próximo número de requisição
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar a última requisição de compra
    const results = await prisma.$queryRaw`
      SELECT "number" FROM "PurchaseRequest"
      ORDER BY "number" DESC
      LIMIT 1
    ` as { number: string }[];

    // Formatar o próximo número
    let nextNumber: string

    if (!results || results.length === 0) {
      // Se não houver requisições, começar com REQ-00001
      nextNumber = 'REQ-00001'
    } else {
      // Obter o número atual e incrementar
      const currentNumber = results[0].number
      
      if (currentNumber && currentNumber.startsWith('REQ-')) {
        const numericPart = parseInt(currentNumber.substring(4), 10)
        nextNumber = `REQ-${(numericPart + 1).toString().padStart(5, '0')}`
      } else {
        // Se o formato for diferente, iniciar com REQ-00001
        nextNumber = 'REQ-00001'
      }
    }

    return NextResponse.json({ number: nextNumber })
  } catch (error) {
    console.error('Erro ao gerar número para requisição:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar número para requisição' },
      { status: 500 }
    )
  }
} 