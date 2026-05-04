# Budget Flow

Aplicacao frontend para controle financeiro compartilhado, com autenticacao JWT, CRUD de transacoes, categorias dinamicas, resumo mensal detalhado e dashboard grafico.

## Repositorio da API

Este repositorio contem apenas o frontend.

API utilizada:

- https://github.com/Lucas-AVNogueira/budget-flow-api

## Stack do frontend

- React 18
- Vite 5
- react-select

## Pre-requisitos

- Node.js 18+
- npm 9+

## Instalacao

```bash
npm install
```

## Configuracao da API

Crie o arquivo .env na raiz do projeto com uma das opcoes abaixo.

Opcao 1: conexao direta com a API

```env
VITE_API_BASE_URL=http://localhost:3001
```

Opcao 2: proxy local do Vite (evita CORS no desenvolvimento)

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://localhost:3001
```

## Executando localmente

1. Suba a API externamente (repositorio budget-flow-api, pasta api).
2. Neste repositorio, execute:

```bash
npm run dev
```

Aplicacao: http://localhost:5173

## Endpoints consumidos pelo frontend

- POST /auth/login
- POST /users
- PATCH /users/password
- POST /users/forgot-password
- POST /users/reset-password
- GET /transactions?mes=&ano=
- POST /transactions
- PUT /transactions/:id
- DELETE /transactions/:id
- GET /summary/:mes/:ano
- GET /categories

## Scripts

- npm run dev: inicia frontend em modo desenvolvimento
- npm run build: gera build de producao
- npm run preview: sobe build local para validacao

## Solucao de problemas

- Frontend sem dados: confirme API ativa em http://localhost:3001
- Erro 401/403: refaca login e valide o header Authorization
- Erro de CORS: use VITE_API_PROXY_TARGET no .env
