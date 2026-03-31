# SGLC

Sistema de Gestão de Licitações e Contratos desenvolvido com `Next.js` e `NextAuth`.

## Execução local

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env.local` com as variáveis abaixo:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-um-segredo-forte-aqui
```

3. Inicie o projeto:

```bash
npm run dev
```

## Deploy na Vercel

Para funcionar em produção, configure estas variáveis de ambiente no painel da Vercel:

```env
NEXTAUTH_URL=https://sglc.vercel.app
NEXTAUTH_SECRET=gere-um-segredo-forte-aqui
```

> Se o domínio da Vercel for diferente, substitua o valor de `NEXTAUTH_URL` pela URL real do deploy.

### Como gerar um secret

Você pode usar um valor aleatório longo, por exemplo:

```bash
openssl rand -base64 32
```

ou qualquer string forte com pelo menos 32 caracteres.

## Observação importante

Atualmente os dados são persistidos em arquivos `data/*.json`. Em ambientes serverless, isso é adequado para demonstração, mas para produção o ideal é migrar para um banco de dados persistente.
