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
# opcional no ambiente local; obrigatório na Vercel para salvar alterações
BLOB_READ_WRITE_TOKEN=
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
BLOB_READ_WRITE_TOKEN=cole-o-token-do-seu-vercel-blob-aqui
```

> Se o domínio da Vercel for diferente, substitua o valor de `NEXTAUTH_URL` pela URL real do deploy.

### Storage persistente na Vercel

Como o ambiente da Vercel é `read-only`, as alterações de licitações e contratos precisam de um storage persistente.

1. No painel da Vercel, abra **Storage**
2. Crie um **Blob Store**
3. Conecte esse store ao projeto
4. Copie a variável `BLOB_READ_WRITE_TOKEN` para **Environment Variables**
5. Faça um novo **Redeploy**

### Como gerar um secret

Você pode usar um valor aleatório longo, por exemplo:

```bash
openssl rand -base64 32
```

ou qualquer string forte com pelo menos 32 caracteres.

## Observação importante

O projeto usa fallback em `data/*.json` no desenvolvimento local e `Vercel Blob` em produção. Para um ambiente institucional, o ideal continua sendo migrar futuramente para um banco de dados persistente, como `PostgreSQL` ou `Supabase`.
