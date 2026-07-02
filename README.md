# XPayments.Digital — Dashboard (Lojista / Admin)

> Painel de controlo institucional Web3 para merchants e administradores XPayments.
> Gestão de wallets multi-moeda, checkout sessions, links de pagamento, settlement e operações cross-border.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)

---

## Visão Geral

**XPayments.Digital** é uma plataforma de pagamentos institucional white-label. Este repositório contém o **Dashboard** — a aplicação SPA (Single Page Application) onde merchants e admins gerem as suas operações.

A plataforma oferece:

- **Gestão de Carteiras** multi-moeda (EUR, BRL, USDT)
- **Checkout Sessions** seguras com price-lock no servidor
- **Links de Pagamento** compartilháveis
- **API Keys** para integração server-to-server
- **Depósitos, Swaps e Payouts** com validação em tempo real
- **KYC** com fluxo de verificação de identidade
- **CRM** com cálculo de LTV e Ticket Médio
- **E-Commerce** com catálogo de produtos e gestão de lojas
- **AI Chat** para suporte contextual
- **PWA** com install prompt e service worker offline

### Arquitetura Micro-Frontend

O ecossistema XPayments segue uma arquitetura de micro-frontends:

| Repositório | Responsabilidade |
|---|---|
| **`app.xpayments.digital`** (este) | Dashboard SPA — gestão de operações (merchant + admin) |
| **Checkout Público** | Página `/pay/[sessionId]` — fluxo de pagamento do comprador |

O Dashboard e o Checkout Público vivem em domínios/separação lógica distintos por questões de escalabilidade, peso do pacote e segurança.

---

## Stack Técnico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, modo SPA) |
| Linguagem | TypeScript 5 (strict) |
| Estilização | Tailwind CSS 4 + shadcn/ui (New York) |
| Estado do cliente | Zustand |
| Estado do servidor | TanStack Query |
| Banco de dados | Prisma ORM (SQLite, dev local) |
| Animações | Framer Motion |
| Notificações | Sonner (toasts) |
| Ícones | Lucide React |
| Validação | Zod + React Hook Form |
| API Client | Fetch nativo + JWT (sem axios no client) |

### Design System (Premium Dark Mode)

```
Background:    #020817
Cards:         #071120 / bg-white/[0.02]
Borders:       border-white/[0.06]
Accent Blue:   #2563eb
Accent Green:  text-emerald-400
Accent Cyan:   text-sky-400
Accent Amber:  text-amber-400
```

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Root layout: providers, tema, PWA, SEO/OG
│   ├── page.tsx            # Entry point da SPA (router via useNavStore)
│   └── pay/[sessionId]/    # Rota pública de checkout (file-based)
├── components/
│   ├── ui/                 # shadcn/ui (New York style)
│   ├── layout/             # Sidebar, header, shell, landing page
│   ├── dashboard/          # KPIs, gráficos, tabelas de transações
│   ├── wallets/            # Carteiras multi-moeda
│   ├── payments/           # Checkout sessions, links de pagamento, API keys
│   ├── crm/                # Gestão de clientes
│   ├── operations/         # Depósitos, swaps, payouts
│   ├── compliance/         # KYC, risk engine, tickets
│   ├── admin/              # Super admin: merchants, users, orgs, config
│   ├── ecommerce/          # Catálogo de produtos, stores
│   ├── ai-chat/            # Assistente virtual com WebSocket
│   └── pwa/                # Service worker registration, install prompt
├── stores/                 # Zustand: auth-store, nav-store, chat-store
├── lib/
│   ├── api/client.ts       # xpApi — API client central (fetch + JWT)
│   ├── constants.ts        # Páginas, navegação, design tokens
│   └── db.ts               # Prisma client singleton
├── types/                  # TypeScript interfaces (xpayments.ts)
└── providers/              # ThemeProvider, QueryClientProvider
```

---

## Navegação (SPA)

A aplicação funciona como SPA — toda a navegação interna é gerenciada via Zustand (`useNavStore.currentPage`) sem recarregamento de página. O mapeamento de páginas está definido em `src/lib/constants.ts`:

```typescript
const PAGES = {
  dashboard: { component: DashboardPage, ... },
  wallets:   { component: WalletsPage, ... },
  deposits:  { component: DepositsPage, ... },
  // ...
};
```

A única rota file-based além de `/` é `/pay/[sessionId]` para o checkout público.

---

## API Client (`xpApi`)

O wrapper central em `src/lib/api/client.ts` fornece acesso tipado a todos os endpoints:

```typescript
import xpApi from '@/lib/api/client';

// Exemplos de uso
const balances = await xpApi.merchant.getDashboard(merchantId);
const sessions = await xpApi.checkout.list({ status: 'active', page: 1 });
const rates = await xpApi.public.getRates();
const links = await xpApi.merchant.getPaymentLinks();
```

### Módulos Disponíveis

| Módulo | Descrição | Autenticação |
|---|---|---|
| `auth` | Login/Registo de Merchant | Pública |
| `admin` | Login de Admin + Stats | Pública (login) / JWT (stats) |
| `public` | Taxas de câmbio (`/public/rates`) | Pública |
| `wallets` | Listagem de carteiras | JWT |
| `analytics` | Overview de BI | JWT |
| `risk` | Perfil de risco | JWT |
| `crm` | Clientes | JWT |
| `transactions` | Transações com filtros | JWT |
| `deposits` | Criação + upload de comprovante | JWT |
| `swaps` | Conversão entre moedas | JWT |
| `payouts` | Envio de pagamentos | JWT |
| `kyc` | Perfil + upgrade de verificação | JWT |
| `merchant` | Dashboard, API keys, links, lojas, produtos | JWT |
| `checkout` | Sessões públicas + listagem do merchant | Mista |
| `tickets` | Sistema de suporte | JWT |
| `organizations` | Gestão de organizações | JWT (Admin) |
| `users` | Gestão de utilizadores | JWT (Admin) |
| `dashboard` | Dados agregados (wallets, transações) | JWT |

### Fluxo de Autenticação

1. `xpApi.auth.login()` devolve `{ token, merchantId, name, tier }`
2. O token é guardado em `sessionStorage` via `setStoredToken()`
3. Todas as requests subsequentes injetam automaticamente `Authorization: Bearer <token>`
4. Em caso de 401, a sessão é limpa e o evento `xp:unauthorized` é disparado

---

## Checkout Sessions (Segurança)

O fluxo de checkout segue o modelo **price-lock no servidor**:

1. **Merchant cria sessão** via API autenticada — preço, moeda e callback ficam no backend
2. **Link público** `/pay/[sessionId]` é enviado ao comprador
3. **Cliente lê dados** via `xpApi.checkout.getSession(sessionId)` — apenas exibe, nunca manipula
4. **Confirmação** via `xpApi.checkout.initiate()` — envia apenas `{ sessionId, customerDetails }`, nunca preço
5. **Webhook** notifica o merchant do status atualizado

Este modelo garante integridade de preço e rastreabilidade completa.

---

## Desenvolvimento

### Pré-requisitos

- [Bun](https://bun.sh/) (runtime e gerenciador de pacotes)

### Instalação

```bash
bun install
```

### Banco de Dados (dev local)

```bash
bun run db:push      # Sincroniza schema Prisma → SQLite
bun run db:generate  # Gera Prisma Client
```

### Servidor de Desenvolvimento

```bash
bun run dev    # http://localhost:3000
```

### Linting

```bash
bun run lint
```

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API REST (sem `/api/v1`) | `https://api.xpayments.digital` |

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.xpayments.digital
```

> O API client adiciona automaticamente `/api/v1` ao valor configurado.

---

## PWA

O projeto inclui suporte a PWA completo:

- **`public/sw.js`** — Service Worker com estratégias de cache (stale-while-revalidate, network-first, cache-first)
- **`public/manifest.json`** — Web App Manifest com ícones 192×192 e 512×512 (standard + maskable)
- **`src/components/pwa/pwa-register.tsx`** — Registro automático do service worker
- **`src/components/pwa/pwa-install-prompt.tsx`** — Banner customizado de instalação (prompt() apenas em onClick)

### Cache Strategy

| Recurso | Estratégia | TTL |
|---|---|---|
| Google Fonts CSS | Stale-while-revalidate | — |
| Google Fonts Files | Cache-first | 30 dias |
| API calls (`/api/`) | Network-first | — |
| HTML pages | Stale-while-revalidate | — |
| Static assets | Stale-while-revalidate | — |

---

## SEO & Metadata

Configurado em `src/app/layout.tsx`:

- Open Graph (title, description, image 1200×630)
- Twitter Card (`summary_large_image`)
- JSON-LD Structured Data (`FinancialService`)
- `robots`: index + follow habilitado
- DNS prefetch para `api.xpayments.digital`
- Canonical URL: `https://xpayments.digital`

---

## Deploy

Configurado com `output: "standalone"` no `next.config.ts`:

```bash
bun run build
NODE_ENV=production bun .next/standalone/server.js
```

### Docker

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