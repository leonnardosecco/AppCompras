# ADR-004: modelagem-banco-dados-sistema-compras

**Status**: Aprovado  
**Data**: 2025-05-07  
**Autor**: [Seu Nome]

## Contexto

O banco usará PostgreSQL com modelagem relacional. Não há necessidade de N:N. Cada despesa pertence a um único projeto.

## Decisão

Modelagem com tabelas: usuários, fornecedores, categorias, projetos e despesas. Despesa com FKs para projeto, categoria e fornecedor.

## Consequências

- Simples, relacional e eficiente
- Suporta exportação de dados por categoria, projeto etc.

## Alternativas Consideradas

- N:N para rateio: descartado
- Logs desde o início: adiado


## ⚙️ Status Atual vs Próximos Passos

**✅ Já implementado:**
- Uso de Prisma ORM com modelo `user` validado
- Banco PostgreSQL em desenvolvimento

**🚧 A fazer:**
- Modelar e implementar tabelas `fornecedores`, `despesas`, `categorias`, `projetos`
- Implementar relações entre as entidades
- Adaptar queries para gerar relatórios e agrupamentos
