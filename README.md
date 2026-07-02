# XPayments.Digital

> Plataforma institucional Web3 para gestão de wallets multi-moeda, settlement automatizado e operações cross-border.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)

---

## Sobre

**XPayments.Digital** é uma plataforma de pagamentos institucional white-label projetada para merchants e administradores operarem em escala global. A plataforma oferece gestão de carteiras multi-moeda (EUR, BRL, USDT), settlement automatizado, checkout sessions seguras, links de pagamento e operações cross-border — tudo centralizado em um dashboard moderno e responsivo.

Construída como uma SPA (Single Page Application) sobre o Next.js 16 App Router, com autenticação JWT, API client nativo (fetch) e integração completa com uma API REST externa, a solução é otimizada para desempenho, segurança e experiência de usuário.

---

## Funcionalidades

### Autenticação
- Login Merchant e Admin com credenciais institucionais
- Autenticação via JWT com renovação automática de sessão
- Token armazenado com segurança no `sessionStorage`

### Dashboard
- Cards de KPI em tempo real (volume, transações, saldo, receita)
- Lista de transações recentes com filtros e paginação
- Gráficos interativos de evolução de receita e volume

### Carteiras Multi-Moeda
- Gestão de saldos em **EUR**, **BRL** e **USDT**
- Visão consolidada e detalhada por moeda
- Histórico de movimentações por carteira

### Pagamentos
- **Checkout Sessions** — fluxo seguro com preço travado no servidor
- **Links de Pagamento** — geração e gestão de links compartilháveis
- **API Keys** — criação e rotação de chaves para integração programática

### CRM
- Cadastro e gestão de clientes
- Cálculo automático de LTV (Lifetime Value) e Ticket Médio
- Histórico de transações por cliente

### Operações
- **Depósitos** — solicitação e acompanhamento de depósitos com upload de comprovante
- **Swaps** — conversão entre moedas (EUR ↔ BRL ↔ USDT) com cotação em tempo real
- **Payouts** — envio de pagamentos e saques com validação de saldo

### Compliance
- **KYC** — fluxo de verificação de identidade com upload de documentos
- **Risk Engine** — perfil de risco com score e indicadores de compliance
- **Tickets** — sistema de suporte integrado para resolução de pendências

### Admin (Super Admin)
- Dashboard administrativo com visão global da plataforma
- Gestão completa de Merchants (criação, edição, suspensão)
- Configuração de **taxas** e parâmetros operacionais

### E-Commerce
- Catálogo de produtos com gestão de SKUs, preços e imagens
- Gestão de **Stores** vinculadas ao merchant

### AI Chat
- Assistente virtual integrado para suporte ao merchant
- Respostas contextuais sobre operações, taxas e status de transações

---

## Arquitetura

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router, modo SPA) |
| Linguagem | TypeScript 5 (strict) |
| Estilização | Tailwind CSS 4 + shadcn/ui (New York) |
| Estado do cliente | Zustand |
| Estado do servidor | TanStack Query |
| Banco de dados | Prisma ORM (SQLite) |
| Animações | Framer Motion |
| Notificações | Sonner (toasts) |
| Ícones | Lucide React |
| Validação | Zod + React Hook Form |
| API Client | Fetch nativo + JWT (sem axios no client) |

A aplicação funciona como uma SPA — toda a navegação é gerenciada via Zustand (`useNavStore`) sem recarregamento de página. O API client utiliza `fetch` nativo com injeção automática do header `Authorization: Bearer <JWT>` em todas as requisições.

---

## Estrutura do Projeto

```
src/
├── app/              # Rotas e layout (App Router)
│   ├── layout.tsx    # Layout raiz com providers, tema e PWA
│   ├── page.tsx      # Entry point da SPA
│   └── pay/          # Rota pública de checkout (/pay/[sessionId])
├── components/       # Componentes reutilizáveis
│   ├── ui/           # Componentes shadcn/ui
│   ├── layout/       # Sidebar, header, shell
│   ├── dashboard/    # Cards KPI, gráficos, tabelas
│   ├── wallets/      # Carteiras multi-moeda
│   ├── payments/     # Checkout, links de pagamento, API keys
│   ├── crm/          # Gestão de clientes
│   ├── operations/   # Depósitos, swaps, payouts
│   ├── compliance/   # KYC, risk engine, tickets
│   ├── admin/        # Super admin dashboard
│   ├── ecommerce/    # Catálogo de produtos, stores
│   ├── ai-chat/      # Assistente virtual
│   └── pwa/          # Service worker e install prompt
├── stores/           # Zustand stores (auth, nav, etc.)
├── lib/              # Utilitários, API client, constantes
├── types/            # Definições de tipos TypeScript
└── providers/        # Context providers (tema, query, etc.)
```

---

## Checkout Sessions

O fluxo de checkout é projetado para máxima segurança contra manipulação de preços:

1. **Merchant cria uma sessão** — preço, moeda, descrição e callback URL são enviados ao backend via API autenticada.
2. **Preço travado no servidor** — o valor é armazenado e assinado no backend, impedindo qualquer alteração no lado do cliente.
3. **Rota pública `/pay/[sessionId]`** — o comprador acessa a página de pagamento via link público contendo apenas o identificador da sessão.
4. **Renderização segura** — o frontend busca os dados da sessão via API e exibe o valor final sem nenhuma possibilidade de manipulação no client-side.
5. **Confirmação** — após o pagamento, o backend notifica o merchant via webhook com o status atualizado.

Este modelo garante integridade de preço (price-lock) e rastreabilidade completa da transação.

---

## Desenvolvimento

### Pré-requisitos

- [Bun](https://bun.sh/) (runtime e gerenciador de pacotes)

### Instalação

```bash
bun install
```

### Banco de dados

```bash
# Sincroniza o schema Prisma com o banco SQLite
bun run db:push

# Gera o Prisma Client
bun run db:generate
```

### Servidor de desenvolvimento

```bash
bun run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Linting

```bash
bun run lint
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_API_URL` | URL base da API REST (sem `/api/v1`) | `https://api.xpayments.digital` |

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=https://api.xpayments.digital
```

> O API client adiciona automaticamente `/api/v1` ao valor configurado.

---

## Deploy

O projeto é configurado com `output: "standalone"` no `next.config.ts`, gerando uma build auto-suficiente pronta para containerização.

### Build de produção

```bash
bun run build
```

### Execução

```bash
NODE_ENV=production bun .next/standalone/server.js
```

### Docker (exemplo)

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", ".next/standalone/server.js"]
```

---

## Licença

**Proprietário** — XPayments.Digital. Todos os direitos reservados.

Uso, distribuição e modificação restritos sem autorização prévia.