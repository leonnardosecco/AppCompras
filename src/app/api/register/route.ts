import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Verificar se já existe algum usuário
    const userCount = await prisma.user.count()
    
    // Se já existir algum usuário, apenas ADMIN pode criar novos usuários
    if (userCount > 0 && role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar novos usuários' },
        { status: 403 }
      )
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userCount === 0 ? 'ADMIN' : role || 'COMPRADOR' // Primeiro usuário sempre será ADMIN
      }
    })

    // Remover a senha do retorno
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
} 