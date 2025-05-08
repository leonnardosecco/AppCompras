# ADR-002: hospedagem-api-node-cloud-google-drive

**Status**: Aprovado  
**Data**: 2025-05-07  
**Autor**: [Seu Nome]

## Contexto

A API será usada por chamadas sob demanda. O objetivo é mantê-la leve e funcional, sem deploy automático. Para anexos, será utilizado o Google Drive.

## Decisão

Executar localmente por enquanto, com possível migração futura para Railway ou Render. Google Drive será usado como armazenamento via API, integrando upload e recuperação de arquivos.

## Consequências

- Facilidade de backup dos arquivos
- Integração inicial exige setup no Google Cloud
- Sem CI/CD, atualização é manual

## Alternativas Consideradas

- Armazenar no banco: descartado
- Criar S3: inviável no momento


## ⚙️ Status Atual vs Próximos Passos

**✅ Já implementado:**
- API rodando localmente
- Planejamento para uso do Google Drive como storage

**🚧 A fazer:**
- Criar projeto no Google Cloud e configurar OAuth
- Implementar upload programático para pastas específicas no Drive
- Definir provedor cloud para futuro deploy da API
