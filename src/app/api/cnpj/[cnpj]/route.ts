import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { cnpj: string } }
) {
  try {
    const cnpj = params.cnpj.replace(/\D/g, '')
    
    if (cnpj.length !== 14) {
      return NextResponse.json(
        { error: 'CNPJ inválido' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`)
    
    if (!response.ok) {
      throw new Error('Erro ao consultar CNPJ')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao consultar CNPJ')
    }

    const formattedData = {
      cnpj: cnpj,
      name: data.razao_social,
      tradeName: data.estabelecimento.nome_fantasia,
      address: {
        street: data.estabelecimento.tipo_logradouro + ' ' + data.estabelecimento.logradouro,
        number: data.estabelecimento.numero,
        complement: data.estabelecimento.complemento,
        district: data.estabelecimento.bairro,
        city: data.estabelecimento.cidade.nome,
        state: data.estabelecimento.estado.sigla,
        zipCode: data.estabelecimento.cep
      },
      phone: data.estabelecimento.ddd1 + data.estabelecimento.telefone1,
      email: data.estabelecimento.email
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error)
    return NextResponse.json(
      { error: 'Erro ao consultar CNPJ' },
      { status: 500 }
    )
  }
} 