import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar a última compra
    const lastPurchase = await prisma.purchase.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Se não houver compras, começar do 1
    if (!lastPurchase) {
      return NextResponse.json({ nextNumber: 1 });
    }

    // Incrementar o último número
    const lastNumber = parseInt(lastPurchase.number);
    const nextNumber = lastNumber + 1;

    return NextResponse.json({ nextNumber });
  } catch (error) {
    console.error('Erro ao gerar próximo número:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar próximo número' },
      { status: 500 }
    );
  }
} 