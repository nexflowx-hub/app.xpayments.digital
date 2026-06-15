# XPayments.Digital — README Técnico

> **Gateway/Agregador de Pagamentos High-Risk** — Receba em Fiat (BRL, EUR, USD), liquide em USDT (Tether).

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nexflowx-hub/app.xpayments.digital&env=NEXT_PUBLIC_API_URL,https://api.xpayments.digital)

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
9. [Módulo: Payment Links](#9-módulo-payment-links)
10. [Data Flow](#10-data-flow)
11. [Estados de Settlement](#11-estados-de-settlement)
12. [Navegação & View Routing](#12-navegação--view-routing)
13. [Deploy — Vercel](#13-deploy--vercel)
14. [Setup & Desenvolvimento](#14-setup--desenvolvimento)
15. [Convenções de Código](#15-convenções-de-código)
16. [Roadmap](#16-roadmap)
17. [Licença](#17-licença)

---

## 1. Visão Geral

O **XPayments.Digital** é um MVP de Gateway de Pagamentos High-Risk com as seguintes características:

- **Cobrança ao cliente final** em moedas Fiat: BRL, EUR, USD.
- **Settlement (payout) ao Merchant** exclusivamente em **USDT (Tether)** na rede blockchain.
- **Arquitetura Headless**: o frontend Next.js consome a nossa API REST própria. Não existem chamadas diretas a Firebase, Supabase ou outros BaaS do lado do cliente.
- **Dark Mode Native**: a estética é permanentemente escura, ao estilo "Control Tower" financeiro / Web3.
- **Motor de Estados Temporais**: os fundos do merchant transitam por 7 estados (INCOMING → PENDING → AVAILABLE, com desvios para RESERVE, AUDIT, BLOCKED, CLEARED).
- **CRM de Pagamentos**: Gestão de Links de Cobrança, Clientes com LTV, e Configuração de Loja.

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
│    GET  /api/v1/merchant/:id/payment-links                         │
│    POST /api/v1/merchant/:id/payment-links                         │
│    GET  /api/v1/merchant/:id/customers                             │
│    POST /api/v1/auth/login                                         │
│    POST /api/v1/payouts/request                                    │
│    ...                                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Authorization: Bearer <token>
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND (Este Repo)                           │
│          https://app.xpayments.digital (Vercel)                    │
│                                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  Page.tsx   │  │  Components  │  │  API Client (Fetch)        │  │
│  │  (Views)    │  │  (Dashboard) │  │  + React Query (TanStack)  │  │
│  └────────────┘  └──────────────┘  └────────────────────────────┘  │
│                                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  globals.css│  │  Zustand     │  │  Prisma (Local SQLite)    │  │
│  │  (Theme)    │  │  (Nav State) │  │  (Cache/Sessions)         │  │
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
| **View Routing** | Navegação via Zustand store (`useNavigationStore`) — sem router file-system para views internas do dashboard. |

---

## 3. Stack Tecnológico

| Categoria | Tecnologia | Versão | Propósito |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.x | SSR, routing, API routes |
| **Linguagem** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Library** | shadcn/ui (New York) | — | Componentes Radix-based |
| **State (Server)** | TanStack React Query | 5.82+ | Fetching, caching, sync |
| **State (Client)** | Zustand | 5.x | Navegação entre views |
| **Data Tables** | TanStack React Table | 8.21+ | Tabelas sort/filter |
| **Formulários** | React Hook Form + Zod | 7.60+ / 4.x | Validação de forms |
| **ORM** | Prisma | 6.x | Local SQLite cache |
| **Animações** | Framer Motion | 12.x | Transições |
| **Gráficos** | Recharts | 2.x | Dados visuais |
| **Ícones** | Lucide React | 0.525+ | Iconografia |
| **Runtime** | Bun | — | Dev server & build tool |
| **Hosting** | Vercel | — | Deploy de produção |

---

## 4. Estrutura do Projeto

```
xpayments-digital/
├── .env.example                        # Template de env vars
├── .env.local                          # Variáveis de ambiente (gitignored)
├── .gitignore
├── next.config.ts                      # ★ Config Next.js + Vercel
├── package.json
├── Caddyfile                           # Reverse proxy local (dev)
├── prisma/
│   └── schema.prisma                   # Schema Prisma (SQLite)
├── db/
│   └── custom.db                       # SQLite local (gitignored)
├── public/
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── globals.css                 # ★ Design System — Dark Theme + Tokens
│   │   ├── layout.tsx                  # Root layout (dark, QueryProvider, fonts)
│   │   ├── page.tsx                    # ★ View Router (Overview / Payment Links / ...)
│   │   └── api/
│   │       └── route.ts                # API routes
│   ├── components/
│   │   ├── ui/                         # shadcn/ui (40+ componentes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── form.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   └── ... (accordion, dialog, dropdown-menu, tooltip, etc.)
│   │   └── dashboard/                  # ★ Componentes de negócio XPayments
│   │       ├── dashboard-sidebar.tsx   #   Sidebar colapsável (Zustand-driven)
│   │       ├── dashboard-header.tsx    #   Header sticky com search + notifs
│   │       ├── balance-overview-cards.tsx  #   4 Cartões de Saldo (API-driven)
│   │       └── payment-links/          #   ★ Módulo Payment Links
│   │           ├── types.ts            #     PaymentLink, CurrencyCode, etc.
│   │           ├── mock-data.ts        #     6 links mock + mock API
│   │           ├── columns.tsx         #     TanStack Table column defs
│   │           ├── data-table.tsx      #     DataTable com search/sort/skeleton
│   │           ├── create-link-sheet.tsx   # Sheet com RHF + Zod form
│   │           └── payment-links-view.tsx  # View completa com stats + table
│   ├── hooks/
│   │   ├── use-merchant-dashboard.ts   # React Query hook (balances)
│   │   ├── use-mobile.ts               # Mobile detection
│   │   └── use-toast.ts                # Toast notifications
│   └── lib/
│       ├── api-client.ts               # ★ Typed fetch wrapper (XPayments API)
│       ├── query-provider.tsx          # React Query client provider
│       ├── navigation-store.ts         # ★ Zustand store (view routing)
│       ├── utils.ts                    # cn() helper (clsx + tailwind-merge)
│       └── db.ts                       # Prisma client instance
├── worklog.md                          # Registo de desenvolvimento
└── README.md                           # Este ficheiro
```

### Convenção de Pastas

- **`src/components/ui/`** — Componentes shadcn/ui puros (não alterar directamente, gerados pelo CLI).
- **`src/components/dashboard/`** — Componentes de negócio do XPayments.
- **`src/components/dashboard/payment-links/`** — Módulo completo de Payment Links (types, mock, table, sheet, view).
- **`src/hooks/`** — Custom React hooks.
- **`src/lib/`** — Utilities, providers, stores, e configurações partilhadas.

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

### Tailwind Custom Classes (Glow Utilities)

Registadas em `@layer utilities` no `globals.css`:

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
- **Mono**: Geist Mono (variável `--font-geist-mono`) — IDs, valores tabulares, código
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
import { xpaymentsApi } from "@/lib/api-client";

const balances = await xpaymentsApi.getMerchantDashboard(
  "merchant-uuid-here",
  "bearer-token-here"
);
// → { INCOMING: 1200, PENDING: 5400, RESERVE: 2150, AVAILABLE: 3000, ... }
```

### Endpoints Implementados

| Método | Path | Descrição | Tipo de Retorno |
|---|---|---|---|
| `GET` | `/api/v1/merchant/:id/dashboard` | Balances do merchant | `MerchantDashboardBalances` |

### Endpoints Previstos (Payment Links, CRM, Store)

| Método | Path | Descrição |
|---|---|---|
| `GET` | `/api/v1/merchant/:id/payment-links` | Listar todos os links |
| `POST` | `/api/v1/merchant/:id/payment-links` | Criar novo link |
| `PATCH` | `/api/v1/merchant/:id/payment-links/:linkId` | Editar link |
| `DELETE` | `/api/v1/merchant/:id/payment-links/:linkId` | Desactivar link |
| `GET` | `/api/v1/merchant/:id/customers` | Listar clientes com LTV |
| `GET` | `/api/v1/merchant/:id/customers/:custId/transactions` | Histórico do cliente |
| `GET` | `/api/v1/merchant/:id/store` | Configuração da loja |
| `PATCH` | `/api/v1/merchant/:id/store` | Atualizar configuração |

### React Query Hook (`src/hooks/use-merchant-dashboard.ts`)

```typescript
import { useMerchantDashboard } from "@/hooks/use-merchant-dashboard";

const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
  useMerchantDashboard({ merchantId: "uuid-aqui" });

// data → { INCOMING, PENDING, RESERVE, AVAILABLE, CLEARED, AUDIT, BLOCKED }
// Auto-refetch: 30s | Stale: 15s | Refetch on focus: true | Retry: 2
```

---

## 7. Variáveis de Ambiente

### `.env.example` (commit to repo)

```env
NEXT_PUBLIC_API_URL="https://api.xpayments.digital"
```

### `.env.local` (gitignored — dev + Vercel)

```env
# Required
NEXT_PUBLIC_API_URL="https://api.xpayments.digital"

# Auth (quando o fluxo estiver pronto)
NEXTAUTH_SECRET=""
NEXTAUTH_URL="https://app.xpayments.digital"

# Database (dev only)
DATABASE_URL="file:./db/custom.db"
```

> **Nota**: `NEXT_PUBLIC_*` é exposta ao browser. Para dados sensíveis (JWT), usar Server Components ou API routes.

### Variáveis no Vercel

Configurar no **Vercel Dashboard → Settings → Environment Variables**:

| Key | Valor | Ambientes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.xpayments.digital` | Production, Preview, Development |

---

## 8. Componentes do Dashboard

### 8.1 `DashboardSidebar`

**Ficheiro**: `src/components/dashboard/dashboard-sidebar.tsx`

| Feature | Detalhe |
|---|---|
| Colapsável | Sim, via shadcn `Sidebar` com `collapsible="icon"` |
| Navegação | Overview, Transactions (badge "12"), Payouts, **Payment Links**, Compliance |
| State | Zustand `useNavigationStore` (lifted state) |
| Mobile | Abre como Sheet (bottom drawer) |
| Shortcut | `Ctrl/Cmd + B` para toggle |

### 8.2 `DashboardHeader`

**Ficheiro**: `src/components/dashboard/dashboard-header.tsx`

| Feature | Detalhe |
|---|---|
| Sticky | `sticky top-0` com `backdrop-blur-md` |
| Search | Barra de pesquisa com ícone (hidden em mobile) |
| Badge "LIVE" | Indicador verde neon |
| Notifications | Sino com count badge ("3") |

### 8.3 `BalanceOverviewCards`

**Ficheiro**: `src/components/dashboard/balance-overview-cards.tsx`

| Prop | Tipo | Descrição |
|---|---|---|
| `data` | `MerchantDashboardBalances \| undefined` | Dados da API (7 estados) |
| `isLoading` | `boolean` | Skeleton loaders |
| `isError` | `boolean` | Estado de erro |
| `error` | `Error \| null` | Objeto de erro |
| `onRetry` | `() => void` | Callback refetch |

**4 Cards Principais**: Incoming (slate), Pending (amber), Risk Reserve (red), Available (USDT neon + CTA).
**3 Cards Secundários** (condicionais): Cleared, Under Audit, Blocked.

---

## 9. Módulo: Payment Links

### Visão Geral

Módulo completo de gestão de links de cobrança hospedados (Hosted Checkout Links).

```
src/components/dashboard/payment-links/
├── types.ts              # PaymentLink, CreateLinkFormValues, CurrencyCode
├── mock-data.ts          # 6 links mock + fetchPaymentLinks() + createPaymentLink()
├── columns.tsx           # TanStack Table column definitions
├── data-table.tsx        # DataTable com search, sort, skeletons, empty state
├── create-link-sheet.tsx # Sheet drawer com formulário RHF + Zod
└── payment-links-view.tsx # View principal com stats + table + sheet
```

### Data Model (`types.ts`)

```typescript
interface PaymentLink {
  id: string;                    // "pl_01JXK2M3N4..."
  name: string;                  // "Premium VPN Subscription"
  description: string;           // "12-month premium VPN access..."
  amount: number;                // 49.9
  currency: CurrencyCode;        // "BRL" | "EUR" | "USD" | "USDT"
  type: "reusable" | "single_use";
  status: "active" | "expired" | "disabled";
  clicks: number;                // 1247
  sales: number;                 // 318
  imageUrl?: string;             // product image URL
  collectShipping: boolean;
  collectTaxId: boolean;
  expiresAt?: string;            // ISO date
  createdAt: string;             // ISO datetime
  updatedAt: string;
  checkoutUrl: string;           // "https://pay.xpayments.digital/l/..."
}
```

### Data Table (`data-table.tsx`)

| Feature | Implementação |
|---|---|
| Framework | TanStack React Table v8 |
| UI | shadcn/ui `<Table>` |
| Colunas | Name (thumbnail + desc), Amount (currency formatted), Type (badge), Performance (sales/clicks/conversion), Status (colored badge), Created (formatted), Actions |
| Sort | Todas as colunas numéricas e de data são sortáveis |
| Search | Filtro global por nome e descrição |
| Skeleton | 5 linhas de skeleton durante loading |
| Empty State | CTA "Create New Link" quando sem dados |
| Actions | Copy URL (clipboard), Open Checkout (external link), Edit, Delete (dropdown) |

### Formulário de Criação (`create-link-sheet.tsx`)

| Seção | Campos | Validação |
|---|---|---|
| **Product Information** | Name, Amount (number), Currency (select: BRL/EUR/USD/USDT), Description (textarea) | Zod: name min 2, amount > 0, currency required |
| **Product Image** | Image URL (input com ícone) + Drag & Drop visual placeholder | Zod: URL válida ou vazio |
| **Configuration** | Reusable Link (switch), Collect Shipping Address (switch), Collect Tax ID/CPF/NIF (switch) | Boolean defaults: reusable=true, others=false |
| **Advanced** | Expiration Date (date picker, optional) | Opcional, só para reusable links |

| Feature | Detalhe |
|---|---|
| Form Library | React Hook Form + Zod |
| Sheet Size | `sm:max-w-lg` (mais largo que o default) |
| Submit | Mutation via React Query, toast de sucesso/erro |
| Reset | Formulário reseta ao fechar o sheet |

### View Principal (`payment-links-view.tsx`)

| Feature | Detalhe |
|---|---|
| Quick Stats | 4 mini-cards: Total Links, Active, Total Sales, Total Clicks |
| Error State | Banner vermelho com retry |
| CTA Header | Botão "Create New Link" (usdt green) |
| Data Fetch | `useQuery` com mock API (800ms delay) |
| Create Mutation | `useMutation` com invalidação de cache + toast |

---

## 10. Data Flow

```
┌──────────────┐     ┌────────────────────┐     ┌───────────────────────────┐
│  page.tsx    │────▶│ useNavigationStore │────▶│ View Router (switch)     │
│  (Client)    │     │   (Zustand)        │     │                           │
└──────────────┘     └────────────────────┘     └───────────┬───────────────┘
                                                           │
              ┌────────────────────────────────────────────┼────────────────┐
              ▼                                            ▼                ▼
     ┌─────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
     │  OverviewView   │  │  PaymentLinksView    │  │ PlaceholderView │
     │                 │  │                      │  │ (Coming Soon)    │
     │ useMerchantDash │  │ useQuery(links)      │  │                  │
     │ board()         │  │ useMutation(create)  │  │                  │
     │       │         │  │       │               │  │                  │
     │       ▼         │  │       ▼               │  │                  │
     │ BalanceCards    │  │ DataTable + Sheet    │  │                  │
     └─────────────────┘  └──────────────────────┘  └──────────────────┘
```

### Fluxo de Refresh

1. **Inicial**: Mount → `useQuery` faz fetch imediato
2. **Polling**: A cada 30s, React Query refaz o GET automaticamente
3. **Focus**: Quando o user volta ao tab, refetch automático
4. **Manual**: Botão de refresh no header ou "Retry" no estado de erro
5. **Indicator**: Timestamp "Synced HH:MM:SS" + spinner durante fetch

---

## 11. Estados de Settlement

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
              │  AUDIT   │ │ BLOCKED  │
              └──────────┘ └──────────┘
```

| Estado | API Key | Cor | Ícone | Descrição |
|---|---|---|---|---|
| Incoming | `INCOMING` | Slate `#94A3B8` | `ArrowDownLeft` | Pagamento recebido, aguarda processamento |
| Pending | `PENDING` | Amber `#F59E0B` | `Clock` | Fundos em trânsito D+1 a D+3 |
| Risk Reserve | `RESERVE` | Red `#EF4444` | `Lock` | Retido por compliance/KYC/AML |
| Available | `AVAILABLE` | Neon Green `#00E5A0` | `Wallet` | Pronto para payout em USDT |
| Cleared | `CLEARED` | Emerald | `ShieldCheck` | Payout já realizado |
| Under Audit | `AUDIT` | Cyan | `FileSearch` | Em revisão manual |
| Blocked | `BLOCKED` | Red | `Ban` | Fundos bloqueados |

---

## 12. Navegação & View Routing

O dashboard usa **navegação client-side via Zustand** em vez de file-system routing para as views internas.

### Store (`src/lib/navigation-store.ts`)

```typescript
import { useNavigationStore, type DashboardView } from "@/lib/navigation-store";

// Ler view activa
const { activeView } = useNavigationStore();

// Mudar de view
const { setActiveView } = useNavigationStore();
setActiveView("Payment Links");
```

### Views Disponíveis

| View | Componente | Estado |
|---|---|---|
| Overview | `OverviewView` (inline) | ✅ Completo — Balance Cards + API |
| Payment Links | `PaymentLinksView` | ✅ Completo — Table + Sheet + Form |
| Transactions | `PlaceholderView` | 🚧 Coming Soon |
| Payouts | `PlaceholderView` | 🚧 Coming Soon |
| Compliance | `PlaceholderView` | 🚧 Coming Soon |
| Settings | `PlaceholderView` | 🚧 Coming Soon |
| Help & Support | `PlaceholderView` | 🚧 Coming Soon |

---

## 13. Deploy — Vercel

### Configuração do `next.config.ts`

O projeto está configurado para deploy direto na Vercel:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",

  // Domínios permitidos para dev/preview
  allowedDevOrigins: [
    "https://app.xpayments.digital",
    "https://*.vercel.app",
    "https://*.space-z.ai",
  ],

  // Imagens externas permitidas
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pay.xpayments.digital" },
      { protocol: "https", hostname: "api.xpayments.digital" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};
```

### Passo-a-Passo: Deploy Inicial

1. **Fork / Push** este repositório para o GitHub:
   ```
   https://github.com/nexflowx-hub/app.xpayments.digital
   ```

2. **Importar na Vercel**:
   - Aceder a [vercel.com/new](https://vercel.com/new)
   - Selecionar o repositório `nexflowx-hub/app.xpayments.digital`
   - Framework Preset: **Next.js** (detectado automaticamente)
   - Build Command: `npm run build` (ou deixar default)
   - Output Directory: `.next` (default para Next.js)

3. **Configurar Environment Variables** no Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL` = `https://api.xpayments.digital`
   - Marcar como disponível em **Production**, **Preview** e **Development**

4. **Deploy** — A Vercel faz o deploy automático em cada push para `main`.

### Deploy Commands

```bash
# Se preferir deploy via CLI
npm i -g vercel
vercel --prod

# Ou linkar ao projeto existente
vercel link
vercel --prod
```

### Domínio Customizado

Na Vercel Dashboard:
1. **Settings → Domains**
2. Adicionar `app.xpayments.digital`
3. Configurar DNS no provedor:
   - **CNAME**: `app` → `cname.vercel-dns.com`

---

## 14. Setup & Desenvolvimento

### Pré-requisitos

- **Bun** (runtime + package manager)
- **Node.js** 18+ (alternativa ao Bun)

### Instalação

```bash
# Clonar
git clone https://github.com/nexflowx-hub/app.xpayments.digital.git
cd app.xpayments.digital

# Instalar dependências
bun install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Gerar cliente Prisma (opcional, para dev local)
bun run db:generate
bun run db:push

# Iniciar
bun run dev
```

### Scripts

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `bun run dev` | Dev server na porta 3000 |
| `build` | `bun run build` | Build de produção (standalone) |
| `start` | `bun run start` | Servidor de produção |
| `lint` | `bun run lint` | ESLint |
| `db:push` | `bun run db:push` | Push Prisma schema |
| `db:generate` | `bun run db:generate` | Gerar Prisma Client |
| `db:migrate` | `bun run db:migrate` | Criar migration |
| `db:reset` | `bun run db:reset` | Reset da DB |

---

## 15. Convenções de Código

### Imports

```typescript
// 1. React / Next.js
import { useState } from "react";

// 2. Third-party
import { useQuery } from "@tanstack/react-query";

// 3. shadcn/ui
import { Button } from "@/components/ui/button";

// 4. Project components
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

// 5. Lib / hooks / types
import { xpaymentsApi } from "@/lib/api-client";
import type { PaymentLink } from "@/components/dashboard/payment-links/types";
```

### Nomenclatura

- **Ficheiros**: `kebab-case.tsx`
- **Componentes**: `PascalCase`
- **Hooks**: `use-kebab-case.ts`
- **Tipos**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **CSS tokens**: `--kebab-case`

### Tailwind

- Usar cores semânticas (`text-usdt`, `bg-pending`, `border-risk`)
- Usar `text-muted-foreground` para texto secundário
- Usar `bg-card` / `bg-surface` para fundos
- Usar `border-border` para bordas padrão

---

## 16. Roadmap

### v0.3.0 — Sprint Actual

- [x] Design System (Dark Theme, paleta USDT, glow utilities)
- [x] Dashboard Layout (Sidebar, Header, Footer)
- [x] 4 Cartões de Saldo + 3 Estados Secundários
- [x] Integração API real (`api.xpayments.digital`)
- [x] React Query (polling 30s, refetch on focus, retry)
- [x] Loading skeletons e Error states
- [x] **Payment Links — DataTable + Sheet + Form (RHF + Zod)**
- [x] **View Routing via Zustand** (navigation store)
- [x] **Vercel deployment configuration**
- [x] **GitHub repository** (`nexflowx-hub/app.xpayments.digital`)

### Próximo Sprint (v0.4.0)

- [ ] Fluxo de Login / Register (NextAuth.js)
- [ ] Tabela de Transações com filtros
- [ ] Gráficos de volume (Recharts)
- [ ] Página de Payouts (Request + History)
- [ ] **Customers / CRM** (LTV, histórico individual)
- [ ] **Store Settings** (branding, webhooks, cores)
- [ ] Landing Page pública
- [ ] Webhook real-time (WebSocket/Socket.io)

### Futuro

- [ ] Multi-currency display (BRL, EUR, USD)
- [ ] Export CSV/Excel de transacções
- [ ] 2FA (TOTP)
- [ ] API Keys management
- [ ] Webhook configuration UI
- [ ] Mobile-responsive hosted checkout
- [ ] Dark/Light mode toggle (se requisitado)

---

## 17. Licença

Propriedade privada. Todos os direitos reservados — XPayments.Digital © 2025.