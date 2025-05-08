# ADR-001: sistema-compras-nodejs-typescript

**Status**: Aprovado  
**Data**: 2025-05-07  
**Autor**: [Seu Nome]

## Contexto

O projeto tem como objetivo substituir o uso do FlowUp com módulos financeiros personalizados por um sistema interno enxuto e funcional. O foco está em permitir controle completo dos campos de despesa, exportação de dados e integração com o Google Drive, visando funcionalidades reais e personalizadas.

Desenvolvido do zero, o sistema usará PostgreSQL como banco de dados em ambiente cloud, com backend em Node.js + TypeScript. O escopo atual é cobrir funcionalidades essenciais, com possibilidade de expansão futura.

## Decisão

Criar um sistema backend com Node.js + TypeScript, banco PostgreSQL, foco em funcionalidades de controle de despesas. Utilização de ferramentas e bibliotecas open source e integração com Google Drive para armazenamento de anexos.

## Consequências

- Controle completo do sistema
- Menor dependência de terceiros
- Exige gestão manual de deploy e segurança
- Dependente da curva de aprendizado do desenvolvedor

## Alternativas Consideradas

- Manter FlowUp: pouca flexibilidade
- No-code: não oferece controle necessário

## Referências

- Documento: Modulo_Compras_Despesas_Daggio_SistemaInterno_Final.pdf


## ⚙️ Status Atual vs Próximos Passos

**✅ Já implementado:**
- Projeto iniciado em Node.js + TypeScript
- Uso de PostgreSQL local

**🚧 A fazer:**
- Migrar PostgreSQL para ambiente em nuvem (Railway ou Supabase)
- Implementar upload de arquivos para Google Drive
- Integrar exportação de planilhas Excel
