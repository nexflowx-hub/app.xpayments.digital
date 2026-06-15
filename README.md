# XPayments.Digital — README Técnico

> **Gateway/Agregador de Pagamentos High-Risk** — Receba em Fiat (BRL, EUR, USD), liquide em USDT (Tether).

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Design System & Paleta de Cores](#5-design-system--paleta-de-cores)
6. [Integração com a API](#6-integração-com-a-api)
7. [Variáveis de Ambiente](#7-variáveis-de-ambiente)
8. [Componentes do Dashboard](#8-componentes-do-dashboard)
9. [Data Flow](#9-data-flow)
10. [Estados de Settlement](#10-estados-de-settlement)
11. [Setup & Desenvolvimento](#11-setup--desenvolvimento)
12. [Convenções de Código](#12-convenções-de-código)
13. [Roadmap](#13-roadmap)
14. [Licença](#14-licença)

---

## 1. Visão Geral

O **XPayments.Digital** é um MVP de Gateway de Pagamentos High-Risk com as seguintes características:

- **Cobrança ao cliente final** em moedas Fiat: BRL, EUR, USD.
- **Settlement (payout) ao Merchant** exclusivamente em **USDT (Tether)** na rede blockchain.
- **Arquitetura Headless**: o frontend Next.js consome a nossa API REST própria. Não existem chamadas diretas a Firebase, Supabase ou outros BaaS do lado do cliente.
- **Dark Mode Native**: a estética é permanentemente escura, ao estilo "Control Tower" financeiro / Web3.
- **Motor de Estados Temporais**: os fundos do merchant transitam por 7 estados (INCOMING → PENDING → AVAILABLE, com desvios para RESERVE, AUDIT, BLOCKED, CLEARED).

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTE FINAL                               │
│            (BRL / EUR / USD — Pix, Card, Bank)                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   XPayments API (Production)                        │
│              https://api.xpayments.digital                          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Auth Layer   │  │  Payment     │  │  Settlement Engine       │  │
│  │  (JWT/Token)  │  │  Processing  │  │  (State Machine D+X)     │  │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘  │
│                                                                     │
│  REST Endpoints:                                                    │
│    GET  /api/v1/merchant/:id/dashboard                             │
│    POST /api/v1/auth/login                                         │
│    POST /api/v1/payouts/request                                    │
│    ...                                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Authorization: Bearer <token>
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND (Este Repo)                     │
│                     http://localhost:3000                           │
│                                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  Page.tsx   │  │  Components  │  │  API Client (Fetch)        │  │
│  │  (Routes)   │  │  (Dashboard) │  │  + React Query (TanStack)  │  │
│  └────────────┘  └──────────────┘  └────────────────────────────┘  │
│                                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  globals.css│  │  Zustand     │  │  Prisma (Local SQLite)    │  │
│  │  (Theme)    │  │  (State)     │  │  (Cache/Sessions)         │  │
│  └────────────┘  └──────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais

| Princípio | Implementação |
|---|---|
| **Headless** | Zero dependência de BaaS client-side. Toda a lógica via API REST própria. |
| **Server-First** | API routes em `src/app/api/` para lógica server-side. SDKs (z-ai-web-dev-sdk) apenas em backend. |
| **Type-Safe** | TypeScript strict em todo o projeto. Interfaces de API tipadas em `src/lib/api-client.ts`. |
| **Optimistic UI** | React Query com `staleTime: 15s` e `refetchInterval: 30s` para actualização em tempo real. |
| **Dark Native** | `<html class="dark">` forçado no layout root. Não existe modo claro. |

---

## 3. Stack Tecnológico

| Categoria | Tecnologia | Versão | Propósito |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.x | SSR, routing, API routes |
| **Linguagem** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Library** | shadcn/ui (New York) | — | Componentes Radix-based |
| **State (Server)** | TanStack React Query | 5.82+ | Fetching, caching, sync |
| **State (Client)** | Zustand | 5.x | Estado global do cliente |
| **ORM** | Prisma | 6.x | Local SQLite cache |
| **Formulários** | React Hook Form + Zod | 7.60+ / 4.x | Validação de forms |
| **Animações** | Framer Motion | 12.x | Transições |
| **Gráficos** | Recharts | 2.x | Dados visuais |
| **Ícones** | Lucide React | 0.525+ | Iconografia |
| **Runtime** | Bun | — | Dev server & build tool |

---

## 4. Estrutura do Projeto

```
xpayments-digital/
├── .env.local                          # Variáveis de ambiente (API URL)
├── .env.example                        # Template de env vars
├── next.config.ts                      # Configuração Next.js (standalone output)
├── Caddyfile                           # Reverse proxy com XTransformPort
├── prisma/
│   └── schema.prisma                   # Schema Prisma (SQLite)
├── db/
│   └── custom.db                       # SQLite local database
├── public/
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── globals.css                 # ★ Design System — Dark Theme + Tokens
│   │   ├── layout.tsx                  # Root layout (dark, QueryProvider, fonts)
│   │   ├── page.tsx                    # ★ Dashboard page (API-integrated)
│   │   └── api/
│   │       └── route.ts                # API routes placeholder
│   ├── components/
│   │   ├── ui/                         # ★ shadcn/ui (40+ componentes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   └── ... (accordion, dialog, dropdown-menu, etc.)
│   │   └── dashboard/                  # ★ Componentes do Dashboard Merchant
│   │       ├── dashboard-sidebar.tsx   #   Sidebar colapsável com navegação
│   │       ├── dashboard-header.tsx    #   Header sticky com search + notifs
│   │       └── balance-overview-cards.tsx  #   4 Cartões de Saldo (API-driven)
│   ├── hooks/
│   │   ├── use-merchant-dashboard.ts   # ★ React Query hook (dashboard data)
│   │   ├── use-mobile.ts               #   Mobile detection
│   │   └── use-toast.ts                #   Toast notifications
│   └── lib/
│       ├── api-client.ts               # ★ Typed fetch wrapper (XPayments API)
│       ├── query-provider.tsx          # ★ React Query client provider
│       ├── utils.ts                    #   cn() helper (clsx + tailwind-merge)
│       └── db.ts                       #   Prisma client instance
└── worklog.md                          # Registo de desenvolvimento
```

### Convenção de Pastas

- **`src/components/ui/`** — Componentes shadcn/ui puros (não alterar directamente, gerados pelo CLI).
- **`src/components/dashboard/`** — Componentes de negócio do XPayments (livre para customização).
- **`src/hooks/`** — Custom React hooks.
- **`src/lib/`** — Utilities, providers, e configurações partilhadas.

---

## 5. Design System & Paleta de Cores

### Filosofia

Dark Mode nativo, estética **"Control Tower"** financeira/Web3. Fundos em grafite/preto profundo, textos em cinza platinado, e acções marcadas com Verde Neon (remetendo ao USDT e à fluidez de blockchain).

### Token Map (CSS Custom Properties)

Definidos em `src/app/globals.css` no bloco `:root`:

| Token CSS | Valor Hex | Nome Semântico | Uso |
|---|---|---|---|
| `--background` | `#0A0A0A` | Deep Black | Fundo principal da app |
| `--card` | `#111111` | Graphite | Fundo dos cards |
| `--surface` | `#0F0F0F` | Surface | Inputs, search bar |
| `--surface-raised` | `#181818` | Raised Surface | Tooltips, popovers elevados |
| `--foreground` | `#E4E4E7` | Platinum | Texto principal |
| `--muted-foreground` | `#71717A` | Muted Gray | Labels, descrições |
| `--primary` / `--usdt` | `#00E5A0` | USDT Neon Green | CTA primário, dinheiro disponível |
| `--pending` | `#F59E0B` | Amber | Fundos em trânsito D+X |
| `--risk` | `#EF4444` | Red | Reserva de compliance |
| `--incoming` | `#94A3B8` | Slate | Fundos acabados de entrar |
| `--border` | `rgba(255,255,255,0.06)` | Ghost Border | Bordas subtis |
| `--ring` | `rgba(0,229,160,0.4)` | Neon Ring | Focus rings |
| `--sidebar` | `#0C0C0C` | Sidebar BG | Fundo da sidebar |

### Tailwind Custom Classes

Estas utilities estão registadas em `@layer utilities` no `globals.css`:

| Classe | Efeito |
|---|---|
| `.glow-usdt` | Box-shadow neon verde suave (20px + 60px blur) |
| `.glow-usdt-strong` | Box-shadow neon verde intenso |
| `.glow-risk` | Box-shadow vermelho suave |
| `.glow-pending` | Box-shadow ambar suave |
| `.text-glow-usdt` | Text-shadow neon verde no texto |

### Tailwind Color Tokens (utilizáveis como classes)

```
bg-usdt / text-usdt / border-usdt          → #00E5A0
bg-pending / text-pending / border-pending  → #F59E0B
bg-risk / text-risk / border-risk           → #EF4444
bg-incoming / text-incoming                 → #94A3B8
bg-surface / bg-surface-raised              → #0F0F0F / #181818
```

### Tipografia

- **Sans**: Geist Sans (variável `--font-geist-sans`)
- **Mono**: Geist Mono (variável `--font-geist-mono`) — usada para IDs, valores tabulares, código
- Valores monetários usam `font-variant-numeric: tabular-nums` para alinhamento

### Scrollbar

Custom dark scrollbar via `::-webkit-scrollbar` com thumb `rgba(255,255,255,0.1)`.

---

## 6. Integração com a API

### Cliente API (`src/lib/api-client.ts`)

O cliente é um **typed fetch wrapper** com as seguintes características:

- **Base URL** lida de `process.env.NEXT_PUBLIC_API_URL`
- **Headers automáticos**: `Content-Type: application/json`, `Accept: application/json`, `Authorization: Bearer <token>` quando fornecido
- **Error class** custom (`XPaymentsApiError`) com status code e body
- **Generic response wrapper**: toda a API devolve `{ success: boolean, data: T, message?: string }`

```typescript
// Exemplo de uso
import { xpaymentsApi } from "@/lib/api-client";

const balances = await xpaymentsApi.getMerchantDashboard(
  "merchant-uuid-here",
  "bearer-token-here"  // opcional até auth estar pronto
);
// → { INCOMING: 1200, PENDING: 5400, RESERVE: 2150, AVAILABLE: 3000, ... }
```

### Endpoints Implementados

| Método | Path | Descrição | Tipo de Retorno |
|---|---|---|---|
| `GET` | `/api/v1/merchant/:id/dashboard` | Balances do merchant | `MerchantDashboardBalances` |

### React Query Hook (`src/hooks/use-merchant-dashboard.ts`)

```typescript
import { useMerchantDashboard } from "@/hooks/use-merchant-dashboard";

function MyComponent() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useMerchantDashboard({ merchantId: "uuid-aqui" });

  // data → { INCOMING: number, PENDING: number, RESERVE: number, AVAILABLE: number, CLEARED: number, AUDIT: number, BLOCKED: number }

  // Auto-refetch a cada 30 segundos
  // Stale após 15 segundos
  // Refetch on window focus
  // 2 retries em caso de falha
}
```

### Query Configuration

| Parâmetro | Valor | Rationale |
|---|---|---|
| `staleTime` | 15,000 ms (15s) | Dados considerados frescos por 15s |
| `refetchInterval` | 30,000 ms (30s) | Polling automático para dados em tempo real |
| `retry` | 2 | Tolerância a falhas de rede pontuais |
| `refetchOnWindowFocus` | `true` | Refresca quando o merchant volta ao tab |

### Query Key Factory

```typescript
merchantKeys.dashboard(merchantId)
// → ["merchant", "dashboard", "uuid"]
```

Isto permite invalidação granular:
```typescript
queryClient.invalidateQueries({ queryKey: merchantKeys.dashboard(id) });
```

---

## 7. Variáveis de Ambiente

### `.env.local`

```env
# URL base da API de produção do XPayments
NEXT_PUBLIC_API_URL="https://api.xpayments.digital"
```

### Variáveis Futuras (previstas)

```env
# Authentication (quando o fluxo de login estiver pronto)
NEXT_PUBLIC_MERCHANT_ID=""          # UUID do merchant logado (via auth)
NEXTAUTH_SECRET=""                  # NextAuth.js secret
NEXTAUTH_URL=""                     # Base URL da app

# Database (Prisma/SQLite local)
DATABASE_URL="file:./db/custom.db"
```

> **Nota**: A variável `NEXT_PUBLIC_*` é exposta ao browser. Para dados sensíveis (tokens JWT), usar Server Components ou API routes que leiam de `process.env.SECRET_VAR` (sem o prefixo `NEXT_PUBLIC_`).

---

## 8. Componentes do Dashboard

### 8.1 `DashboardSidebar`

**Ficheiro**: `src/components/dashboard/dashboard-sidebar.tsx`
**Tipo**: Client Component (`"use client"`)
**Props**: Nenhuma (self-contained)

| Feature | Detalhe |
|---|---|
| Colapsável | Sim, via shadcn `Sidebar` com `collapsible="icon"` |
| Navegação Principal | Overview, Transactions (badge "12"), Payouts, Payment Links, Compliance |
| Navegação Sistema | Settings, Help & Support |
| Branding | Logo "XPayments / Digital" com ícone Zap em fundo usdt/15 |
| Avatar Dropdown | Merchant Co. com email, Account Settings, Log out |
| Keyboard Shortcut | `Ctrl/Cmd + B` para toggle |
| Mobile | Abre como Sheet (bottom drawer) |

### 8.2 `DashboardHeader`

**Ficheiro**: `src/components/dashboard/dashboard-header.tsx`
**Tipo**: Client Component
**Props**: Nenhuma

| Feature | Detalhe |
|---|---|
| Sticky | `sticky top-0` com `backdrop-blur-md` |
| Search | Barra de pesquisa com ícone (hidden em mobile) |
| Badge "LIVE" | Indicador verde neon do ambiente |
| Notifications | Sino com count badge ("3") |
| Sidebar Trigger | Botão de toggle da sidebar |

### 8.3 `BalanceOverviewCards`

**Ficheiro**: `src/components/dashboard/balance-overview-cards.tsx`
**Tipo**: Client Component

**Props**:

| Prop | Tipo | Descrição |
|---|---|---|
| `data` | `MerchantDashboardBalances \| undefined` | Dados da API (7 estados) |
| `isLoading` | `boolean` | Mostra skeleton loaders |
| `isError` | `boolean` | Mostra estado de erro |
| `error` | `Error \| null` | Objeto de erro (para debug) |
| `onRetry` | `() => void` | Callback para refetch manual |

**Comportamento**:

1. **Loading**: 4 Skeleton cards com animação pulse
2. **Error**: Card de erro com ícone Wi-Fi Off e botão "Retry"
3. **Sucesso — Cards Principais**:
   - **Incoming** (`INCOMING`): Cor neutra slate, ícone ArrowDownLeft
   - **Pending** (`PENDING`): Border/glow ambar, ícone Clock, "In transit D+1 to D+3"
   - **Risk Reserve** (`RESERVE`): Border/glow vermelho, ícone Lock, "Held by compliance"
   - **Available to Withdraw** (`AVAILABLE`): **Grande destaque** — texto em verde neon com glow, gradiente sutil, botão CTA **"Request Payout"**
4. **Sucesso — Estados Secundários** (aparecem apenas quando > 0):
   - Cleared (`CLEARED`): Ícone ShieldCheck, cor emerald
   - Under Audit (`AUDIT`): Ícone FileSearch, cor cyan
   - Blocked (`BLOCKED`): Ícone Ban, cor red
5. **Total Line**: Aparece quando o total dos 4 estados principais > 0

**Formatação**: Todos os valores usam `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.

---

## 9. Data Flow

```
┌──────────────┐     ┌────────────────────┐     ┌───────────────────────────┐
│  page.tsx    │────▶│ useMerchantDashboard│────▶│ GET /api/v1/merchant/:id  │
│  (Client)    │◀────│ (React Query Hook)  │◀────│ /dashboard                │
│              │     │                    │     │ (api.xpayments.digital)    │
└──────┬───────┘     └────────────────────┘     └───────────────────────────┘
       │
       │ props: { data, isLoading, isError, onRetry }
       ▼
┌──────────────────────┐
│ BalanceOverviewCards │
│ (4 Primary + 3 Sec.) │
└──────────────────────┘
```

### Fluxo de Refresh

1. **Inicial**: Mount → `useQuery` faz fetch imediato
2. **Polling**: A cada 30s, React Query refaz o GET automaticamente
3. **Focus**: Quando o user volta ao tab, refetch automático
4. **Manual**: Botão de refresh no header ou "Retry" no estado de erro
5. **Indicator**: Ícone spinning `RefreshCw` durante fetch + timestamp "Synced HH:MM:SS"

---

## 10. Estados de Settlement

A API devolve **7 estados** que representam o ciclo de vida dos fundos:

```
                    ┌──────────┐
                    │ INCOMING │  ← Acabou de entrar
                    └────┬─────┘
                         │
                         ▼
                    ┌──────────┐
               ┌───▶│ PENDING  │  ← Em trânsito (D+1 a D+3)
               │    └────┬─────┘
               │         │
               │         ▼
               │    ┌──────────┐
               │    │ AVAILABLE│  ← Pronto para sacar (USDT)
               │    └────┬─────┘
               │         │
               │         ▼
               │    ┌──────────┐
               │    │ CLEARED  │  ← Payout concluído
               │    └──────────┘
               │
               │    ┌──────────┐
               └────│ RESERVE  │  ← Bloqueado por compliance
                    └────┬─────┘
                         │
                    ┌────┴─────┐
                    ▼          ▼
              ┌──────────┐ ┌──────────┐
              │  AUDIT   │ │ BLOCKED  │  ← Estados de excepção
              └──────────┘ └──────────┘
```

| Estado | API Key | Cor | Ícone | Descrição |
|---|---|---|---|---|
| Incoming | `INCOMING` | Slate `#94A3B8` | `ArrowDownLeft` | Pagamento recebido, aguarda processamento |
| Pending | `PENDING` | Amber `#F59E0B` | `Clock` | Fundos em trânsito D+1 a D+3 |
| Risk Reserve | `RESERVE` | Red `#EF4444` | `Lock` | Retido por compliance/KYC/AML |
| Available | `AVAILABLE` | Neon Green `#00E5A0` | `Wallet` | Pronto para payout em USDT |
| Cleared | `CLEARED` | Emerald | `ShieldCheck` | Payout já realizado com sucesso |
| Under Audit | `AUDIT` | Cyan | `FileSearch` | Em revisão manual pela equipa de compliance |
| Blocked | `BLOCKED` | Red | `Ban` | Fundos bloqueados permanentemente |

---

## 11. Setup & Desenvolvimento

### Pré-requisitos

- **Bun** (runtime + package manager)
- **Node.js** 18+ (alternativa ao Bun)

### Instalação

```bash
# Clonar o repositório
git clone <repo-url> xpayments-digital
cd xpayments-digital

# Instalar dependências
bun install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com a URL da API

# Gerar cliente Prisma
bun run db:generate

# Push schema para a DB local
bun run db:push
```

### Desenvolvimento

```bash
# Iniciar o dev server (porta 3000)
bun run dev

# Verificar qualidade do código
bun run lint

# Acessar: http://localhost:3000
```

### Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `bun run dev` | Dev server na porta 3000 (log para dev.log) |
| `build` | `bun run build` | Build de produção (standalone) |
| `start` | `bun run start` | Servidor de produção |
| `lint` | `bun run lint` | ESLint |
| `db:push` | `bun run db:push` | Push Prisma schema para SQLite |
| `db:generate` | `bun run db:generate` | Gerar Prisma Client |
| `db:migrate` | `bun run db:migrate` | Criar migration Prisma |
| `db:reset` | `bun run db:reset` | Reset da base de dados |

---

## 12. Convenções de Código

### Imports

```typescript
// 1. React / Next.js
import { useState } from "react";
import { Metadata } from "next";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";

// 3. shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 4. Project components
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

// 5. Lib / hooks / types
import { xpaymentsApi } from "@/lib/api-client";
import { useMerchantDashboard } from "@/hooks/use-merchant-dashboard";
import type { MerchantDashboardBalances } from "@/lib/api-client";
```

### Componentes

- Usar **`"use client"`** apenas quando necessário (state, effects, event handlers)
- Preferir **Server Components** por default
- Componentes shadcn/ui em `src/components/ui/`
- Componentes de negócio em `src/components/dashboard/`

### Nomenclatura

- **Ficheiros**: `kebab-case.tsx` (ex: `balance-overview-cards.tsx`)
- **Componentes**: `PascalCase` (ex: `BalanceOverviewCards`)
- **Hooks**: `use-kebab-case.ts` (ex: `use-merchant-dashboard.ts`)
- **Tipos/Interfaces**: `PascalCase` (ex: `MerchantDashboardBalances`)
- **Constants**: `UPPER_SNAKE_CASE` (ex: `TEST_MERCHANT_ID`)
- **CSS tokens**: `--kebab-case` (ex: `--usdt-muted`)

### Tailwind

- Usar as cores semânticas do tema (`text-usdt`, `bg-pending`, `border-risk`) em vez de valores hex hard-coded
- Usar `text-muted-foreground` para texto secundário
- Usar `bg-card` / `bg-surface` para fundos de componentes
- Usar `border-border` para bordas padrão

---

## 13. Roadmap

### MVP Actual (v0.2.0)

- [x] Design System (Dark Theme, paleta USDT)
- [x] Dashboard Layout (Sidebar, Header, Footer)
- [x] 4 Cartões de Saldo (INCOMING, PENDING, RESERVE, AVAILABLE)
- [x] 3 Estados Secundários (CLEARED, AUDIT, BLOCKED)
- [x] Integração API real (`api.xpayments.digital`)
- [x] React Query (polling 30s, refetch on focus, retry)
- [x] Loading skeletons e Error states
- [x] USDT formatter com `Intl.NumberFormat`

### Próximo Sprint

- [ ] Fluxo de Login / Register (NextAuth.js)
- [ ] Tabela de Transações com filtros
- [ ] Gráficos de volume (Recharts)
- [ ] Página de Payouts (Request + History)
- [ ] Payment Links (CRUD)
- [ ] Página de Compliance
- [ ] Landing Page pública
- [ ] Webhook real-time (WebSocket/Socket.io)

### Futuro

- [ ] Multi-currency display (BRL, EUR, USD)
- [ ] Export CSV/Excel de transacções
- [ ] 2FA (TOTP)
- [ ] API Keys management
- [ ] Webhook configuration
- [ ] Dark/Light mode toggle (se requisitado)

---

## 14. Licença

Propriedade privada. Todos os direitos reservados — XPayments.Digital © 2025.