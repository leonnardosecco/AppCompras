# ADR-003: autenticacao-simples-login-senha-nodejs

**Status**: Aprovado  
**Data**: 2025-05-07  
**Autor**: [Seu Nome]

## Contexto

O sistema terá autenticação básica via email/senha. A meta é manter login funcional e seguro com baixo overhead.

## Decisão

Uso do NextAuth com `CredentialsProvider`, bcrypt para hash, JWT para autenticação stateless. Erros genéricos, hash seguro, e controle manual dos usuários.

## Consequências

- Simples e seguro para o contexto atual
- Pode ser expandido para perfis no futuro

## Alternativas Consideradas

- OAuth, social login: descartado neste momento
- Sessões com cookies: evitado para manter stateless

## Referências

- Libs: next-auth, bcryptjs


## ⚙️ Status Atual vs Próximos Passos

**✅ Já implementado:**
- NextAuth com `CredentialsProvider`
- Hash de senha com bcrypt
- JWT com payload customizado

**🚧 A fazer:**
- Mover `AUTH_SECRET` para variável de ambiente
- Melhorar mensagens de erro para evitar exposição
- Adicionar proteção contra múltiplas tentativas (rate limit)
- Validar e sanitizar campos de entrada
