# XPayments.Digital — README Tecnico Completo

> **Plataforma institucional Web3 para gestao de wallets multi-moeda, settlement automatizado e operacoes cross-border.**
>
> A ponte entre o sistema financeiro tradicional e a economia digital.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nexflowx-hub/app.xpayments.digital&env=NEXT_PUBLIC_API_URL,https://api.xpayments.digital)

---

## Indice

1. [Visao Geral](#1-visao-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Stack Tecnologico](#3-stack-tecnologico)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Design System — Dark Control Tower](#5-design-system--dark-control-tower)
6. [Sistema de Tipos TypeScript](#6-sistema-de-tipos-typescript)
7. [API Client & Integracao](#7-api-client--integracao)
8. [Stores — Estado Global (Zustand)](#8-stores--estado-global-zustand)
9. [RBAC & Permissoes](#9-rbac--permissoes)
10. [Navegacao & View Routing](#10-navegacao--view-routing)
11. [Modulo de Pagamentos — White-Label](#11-modulo-de-pagamentos--white-label)
12. [Motor de Estados (Settlement)](#12-motor-de-estados-settlement)
13. [Data Flow](#13-data-flow)
14. [Componentes do Dashboard](#14-componentes-do-dashboard)
15. [Variaveis de Ambiente](#15-variaveis-de-ambiente)
16. [Deploy — Vercel](#16-deploy--vercel)
17. [Setup & Desenvolvimento](#17-setup--desenvolvimento)
18. [Convencoes de Codigo](#18-convencoes-de-codigo)
19. [Roadmap](#19-roadmap)
20. [Licenca](#20-licenca)

---

## 1. Visao Geral

O **XPayments.Digital** e uma plataforma institucional de pagamentos com as seguintes capacidades:

- **Cobranca multi-moeda**: BRL (PIX), EUR (SEPA, Card, MBWAY), USD (Card, ACH)
- **Settlement em USDT**: Payout ao merchant exclusivamente em USDT (Tether) na rede blockchain
- **Wallets multi-currency**: EUR, BRL, USDT, USD com balances por estado
- **Arquitetura Headless**: Frontend Next.js consome API REST propria — zero dependencia de BaaS client-side
- **Dark Mode Nativo**: Estetica "Control Tower" financeiro/Web3 — nao existe modo claro
- **Motor de Estados Temporais**: Fundos transitam por 7 estados (INCOMING → PENDING → AVAILABLE, com desvios para RESERVE, AUDIT, BLOCKED, CLEARED)
- **White-Label Compliance**: Nomes de providers nunca expostos ao utilizador final
- **RBAC Completo**: 5 roles com matriz de permissoes granular (customer, merchant, super_merchant, admin, operator)
- **KYC Multi-Tier**: 4 niveis de verificacao (TIER_0 a TIER_3)

---

## 2. Arquitetura do Sistema

```
+---------------------------------------------------------------------+
|                         CLIENTE FINAL                               |
|             (BRL / EUR / USD — PIX, Card, MBWAY, Bank)             |
+------------------------------------+--------------------------------+
                                     |
                                     v
+---------------------------------------------------------------------+
|                   XPayments API (Production)                        |
|              https://api.xpayments.digital/api/v1                    |
|                                                                     |
|  +----------------+  +----------------+  +------------------------+  |
|  |  Auth Layer     |  |  Payment       |  |  Settlement Engine     |  |
|  |  (JWT Bearer)   |  |  Processing    |  |  (State Machine D+X)   |  |
|  +----------------+  +----------------+  +------------------------+  |
|                                                                     |
|  REST Endpoints:                                                    |
|    POST /api/v1/auth/login          |  POST /api/v1/auth/register  |
|    GET  /api/v1/auth/me             |  GET  /api/v1/wallets        |
|    GET  /api/v1/transactions        |  POST /api/v1/deposits       |
|    POST /api/v1/swaps               |  POST /api/v1/withdrawals    |
|    GET  /api/v1/kyc/profile         |  POST /api/v1/kyc/upgrade    |
|    GET  /api/v1/merchant/links      |  POST /api/v1/merchant/links |
|    GET  /api/v1/merchant/api-keys   |  POST /api/v1/merchant/...   |
|    GET  /api/v1/tickets             |  GET  /api/v1/organizations  |
|    GET  /api/v1/users               |  GET  /api/v1/public/rates   |
+------------------------------------+--------------------------------+
                                     | Authorization: Bearer <token>
                                     |
                                     v
+---------------------------------------------------------------------+
|              NEXT.JS FRONTEND (Este Repo)                           |
|          https://app.xpayments.digital (Vercel)                    |
|                                                                     |
|  +------------+  +------------------+  +------------------------+   |
|  |  page.tsx  |  |  Components      |  |  API Client (Axios)    |   |
|  |  (Views)   |  |  (14 paginas)    |  |  + JWT Interceptors    |   |
|  +------------+  +------------------+  +------------------------+   |
|                                                                     |
|  +------------+  +------------------+  +------------------------+   |
|  | globals.css|  |  Zustand Stores  |  |  TypeScript Types      |   |
|  | (Design)   |  |  (Auth/Nav/BaaS) |  |  (xpayments.ts)        |   |
|  +------------+  +------------------+  +------------------------+   |
+---------------------------------------------------------------------+
```

### Principios Arquiteturais

| Principio | Implementacao |
|---|---|
| **Headless** | Zero dependencia de BaaS client-side. Toda a logica via API REST propria. |
| **Server-First** | API routes em `src/app/api/` para logica server-side. SDKs (z-ai-web-dev-sdk) apenas em backend. |
| **Type-Safe** | TypeScript strict. Interfaces rigorosamente alinhadas ao Prisma Schema em `src/types/xpayments.ts`. |
| **Dark Native** | `<html class="dark">` forçado via ThemeProvider. Background `#0A0E1A` (deep navy-black). |
| **View Routing** | Navegacao via Zustand store (`useNavStore`) — sem router file-system para views internas do dashboard. |
| **White-Label** | Zero nomes de providers (Stripe, Onramp.Money, Ghost Middleware) na UI. |
| **PT-BR Native** | Interface inteiramente em Portugues do Brasil. |

---

## 3. Stack Tecnologico

| Categoria | Tecnologia | Versao | Proposito |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.x | SSR, routing, API routes, standalone output |
| **Linguagem** | TypeScript | 5.x | Type safety (strict mode) |
| **Runtime** | Bun | — | Dev server, package manager, build tool |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS com `@theme inline` |
| **UI Library** | shadcn/ui (New York) | 40+ componentes | Radix-based, acessivel |
| **State (Client)** | Zustand | 5.x | Auth, Navigation, BaaS scope |
| **State (Server)** | TanStack React Query | 5.82+ | Fetching, caching, background sync |
| **Data Tables** | TanStack React Table | 8.21+ | Tabelas sort/filter/pagination |
| **Formularios** | React Hook Form + Zod | 7.60+ / 4.x | Validacao de forms |
| **HTTP Client** | Axios | 1.16+ | API client com JWT interceptors |
| **ORM** | Prisma | 6.x | Local SQLite (dev cache) |
| **Animacoes** | Framer Motion | 12.x | Transicoes e micro-interacoes |
| **Graficos** | Recharts | 2.x | Dados visuais no dashboard |
| **Icones** | Lucide React | 0.525+ | Iconografia consistente |
| **Fonts** | Inter + JetBrains Mono | Google Fonts | Sans para UI, Mono para dados tabulares |
| **Hosting** | Vercel | — | Deploy de producao (standalone) |

---

## 4. Estrutura do Projeto

```
app.xpayments.digital/
|-- .env.example                           # Template de variaveis de ambiente
|-- .gitignore
|-- Caddyfile                              # Reverse proxy local (dev)
|-- next.config.ts                         # Next.js config (output: standalone)
|-- package.json                           # v2.0.0 — XPayments.Digital
|-- tailwind.config.ts                     # Tailwind com shadcn/ui tokens
|-- tsconfig.json                          # TypeScript strict + path aliases
|-- components.json                        # shadcn/ui config
|-- postcss.config.mjs                     # PostCSS + Tailwind 4
|-- eslint.config.mjs                      # ESLint flat config
|
|-- prisma/
|   |-- schema.prisma                      # Schema Prisma (SQLite local)
|
|-- db/
|   |-- custom.db                          # SQLite local (gitignored)
|
|-- public/
|   |-- logo.svg                           # Logo XPayments (verde neon)
|   |-- logo.png                           # Logo XPayments (bitmap)
|   |-- og-image.png                       # Open Graph image (1200x630)
|   |-- manifest.json                      # PWA manifest
|   |-- robots.txt                         # SEO robots
|
|-- src/
|   |-- app/
|   |   |-- globals.css                    # Design System completo (tokens + animacoes)
|   |   |-- layout.tsx                     # Root layout (dark, ThemeProvider, fonts, metadata)
|   |   |-- page.tsx                       # View Router principal (auth guard + page switcher)
|   |   |-- api/
|   |       |-- route.ts                   # API route generica
|   |       |-- health/route.ts            # Health check endpoint
|   |       |-- binance/route.ts           # Proxy de dados Binance (precios crypto)
|   |
|   |-- components/
|   |   |-- ui/                            # 40+ componentes shadcn/ui (nao alterar diretamente)
|   |   |   |-- button.tsx, card.tsx, table.tsx, dialog.tsx, sheet.tsx,
|   |   |   |-- sidebar.tsx, select.tsx, form.tsx, tabs.tsx, badge.tsx,
|   |   |   |-- skeleton.tsx, tooltip.tsx, popover.tsx, separator.tsx,
|   |   |   |-- scroll-area.tsx, switch.tsx, avatar.tsx, input.tsx,
|   |   |   |-- dropdown-menu.tsx, alert-dialog.tsx, command.tsx, ...
|   |   |
|   |   |-- layout/                        # Layout principal da aplicacao
|   |   |   |-- xp-landing.tsx             # Landing page + Login + Register
|   |   |   |-- xp-sidebar.tsx             # Sidebar colapsavel com RBAC
|   |   |   |-- xp-login.tsx               # Formulario de login
|   |   |
|   |   |-- shared/                        # Componentes partilhados
|   |   |   |-- animated-grid-bg.tsx       # Background animado (grid neon)
|   |   |   |-- crypto-cards.tsx           # Cartoes de informacao crypto
|   |   |   |-- tradingview-widget.tsx     # Widget TradingView
|   |   |
|   |   |-- dashboard/                     # Paginas do Dashboard
|   |   |   |-- dashboard-page.tsx         # Painel de Controle (overview)
|   |   |   |-- account-manager-dashboard.tsx  # Dashboard BaaS (Account Manager)
|   |   |   |-- admin-tickets-page.tsx     # Tickets / Operacoes (admin)
|   |   |   |-- admin-users-page.tsx       # Gestao de Utilizadores (admin)
|   |   |   |-- admin-fees-page.tsx        # Taxas & Comissoes (admin)
|   |   |   |-- admin-organizations-page.tsx  # Gestao de Organizacoes (admin)
|   |   |   |-- merchant-links-page.tsx    # Links de Pagamento (merchant)
|   |   |   |-- merchant-api-keys-page.tsx # Gestao de API Keys (merchant)
|   |   |   |-- merchant-checkouts-page.tsx  # Configuracao de Checkouts (merchant)
|   |   |
|   |   |-- wallet/                        # Modulo Wallet
|   |   |   |-- wallets-page.tsx           # Carteiras (balances multi-currency)
|   |   |   |-- deposits-page.tsx          # Depositar (onramp fiat → crypto)
|   |   |   |-- swaps-page.tsx             # Swap entre moedas
|   |   |   |-- withdrawals-page.tsx       # Sacar (USDT → blockchain/external)
|   |   |   |-- transactions-page.tsx      # Historico de transacoes
|   |   |
|   |   |-- kyc/
|   |       |-- kyc-page.tsx               # Verificacao KYC (4 tiers)
|   |
|   |-- types/
|   |   |-- index.ts                       # Re-exports de tipos partilhados
|   |   |-- xpayments.ts                   # ** FONTE DA VERDADE ** — Todos os tipos alinhados ao Prisma Schema
|   |
|   |-- stores/
|   |   |-- auth-store.ts                  # Auth state (Zustand + sessionStorage persist)
|   |   |-- nav-store.ts                   # Navegacao entre views (Zustand)
|   |   |-- baas-store.ts                  # BaaS scope context para Account Managers
|   |
|   |-- hooks/
|   |   |-- use-toast.ts                   # Toast notifications hook
|   |   |-- use-mobile.ts                  # Mobile detection hook
|   |
|   |-- lib/
|   |   |-- api/
|   |   |   |-- client.ts                  # ** API Client (Axios) ** — JWT interceptors, unwrap pattern
|   |   |-- db.ts                          # Prisma client instance (SQLite)
|   |   |-- utils.ts                       # cn() helper (clsx + tailwind-merge)
|   |   |-- mock-data.ts                   # Dados mock para desenvolvimento
|   |
|   |-- providers/
|       |-- index.ts                       # Barrel export de providers
|       |-- theme-provider.tsx             # next-themes provider (dark default)
```

### Convencao de Pastas

| Pasta | Regra |
|---|---|
| `src/components/ui/` | Componentes shadcn/ui — gerados pelo CLI, nao editar diretamente |
| `src/components/layout/` | Layout shell (landing, sidebar, login) |
| `src/components/dashboard/` | Paginas internas do dashboard (admin + merchant views) |
| `src/components/wallet/` | Modulo wallet (carteiras, depositos, swaps, saques, transacoes) |
| `src/components/kyc/` | Modulo de verificacao KYC |
| `src/components/shared/` | Componentes partilhados entre modulos |
| `src/types/` | TypeScript interfaces (xpayments.ts e fonte da verdade) |
| `src/stores/` | Zustand stores (auth, nav, baas) |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Utilities, API client, DB client |

---

## 5. Design System — Dark Control Tower

### Filosofia

Estetica **"Dark Control Tower"** financeira/Web3. Fundos em deep navy-black (`#0A0E1A`), textos em cinza platinado, e acoes marcadas com **Verde Neon** (`#00FF7F`) — remetendo ao USDT e a fluidez de blockchain. Inspirado em centros de controlo de operacoes financeiras institucionais.

### Paleta Principal

| Token CSS | Valor | Nome Semantico | Uso |
|---|---|---|---|
| `--background` (dark) | `#0A0E1A` | Deep Navy Black | Fundo principal da app |
| `--foreground` | `oklch(0.985 0 0)` | Platinum White | Texto principal |
| `--card` | `oklch(0.205 0 0)` | Graphite | Fundo dos cards |
| `--muted` | `oklch(0.269 0 0)` | Muted Dark | Elementos secundarios |
| `--muted-foreground` | `oklch(0.708 0 0)` | Muted Gray | Labels, descricoes |
| `--border` | `rgba(255,255,255,10%)` | Ghost Border | Bordas sutis |
| `--input` | `rgba(255,255,255,15%)` | Input Border | Inputs, selects |
| `--ring` | `oklch(0.556 0 0)` | Focus Ring | Anel de foco |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Red | Erros, acoes destrutivas |

### Paleta Neon (Verde USDT)

Definida no bloco `@theme inline` do `globals.css` — disponivel como classes Tailwind `neon-*`:

| Token | Valor | Uso |
|---|---|---|
| `--color-neon-50` | `#edfff5` | Background hover leve |
| `--color-neon-100` | `#d5ffea` | Background hover medio |
| `--color-neon-200` | `#aeffd7` | Background selection |
| `--color-neon-300` | `#70ffb8` | Texto destacado |
| `--color-neon-400` | `#00FF7F` | **Cor primaria neon** |
| `--color-neon-500` | `#00E672` | Hover state |
| `--color-neon-600` | `#00CC66` | Pressed state |
| `--color-neon-700` | `#00994D` | Texto escuro neon |
| `--color-neon-800` | `#007A3D` | Borders neon |
| `--color-neon-900` | `#005C2E` | Deep neon |
| `--color-neon-950` | `#003319` | Deepest neon |

### Utilitarios CSS (Glow & Animacao)

| Classe | Efeito |
|---|---|
| `.text-neon-glow` | Text-shadow neon verde (10px + 20px blur) |
| `.bg-neon-glow` | Box-shadow neon verde suave (15px + 30px) |
| `.border-neon-glow` | Box-shadow neon verde nas bordas (8px inner/outer) |
| `.text-gradient-neon` | Gradiente animado neon (#00FF7F → #00CC66) no texto |
| `.xpayments-grid-bg` | Background com grid neon animado (radial + flow) |
| `.xpayments-sweep` | Linha de varrimento horizontal + vertical neon |
| `.animate-ticker-scroll` | Scroll horizontal infinito (40s, pause on hover) |
| `.animate-marquee-scroll` | Marquee de logos (30s, pause on hover) |
| `.animate-float-up` | Flutuacao vertical suave (6s) |
| `.animate-pulse-glow` | Pulsacao de opacidade neon (4s) |
| `.animate-slide-in-left/right` | Entrada lateral com fade (0.6s) |
| `.animate-gradient-x` | Gradiente background animado (8s) |

### Tipografia

| Fonte | Uso | Variavel CSS |
|---|---|---|
| **Inter** | UI geral, labels, botoes | `--font-sans` |
| **JetBrains Mono** | Valores tabulares, IDs, codigo, valores monetarios | `--font-mono` |

Valores monetarios usam `font-variant-numeric: tabular-nums` para alinhamento.

### Scrollbar

Custom dark scrollbar via `::-webkit-scrollbar` com thumb `rgba(63,63,70,0.5)` e hover `rgba(63,63,70,0.8)`.

---

## 6. Sistema de Tipos TypeScript

### Ficheiro: `src/types/xpayments.ts` (Fonte da Verdade)

Todos os tipos sao rigorosamente alinhados ao **Prisma Schema** do backend XPayments.Digital.

#### Enums

```typescript
enum OrgRole { ADMIN, OPERATOR, ACCOUNT_MANAGER }
enum TierLevel { TIER_0_UNVERIFIED, TIER_1_BASIC, TIER_2_VERIFIED, TIER_3_CORPORATE }
enum AccountStatus { ACTIVE, SUSPENDED, BLOCKED }
enum Currency { EUR, BRL, USDT, USD }
enum TransactionType { PROXY_INCOMING, SETTLEMENT, PAYOUT, SWAP, TRANSFER, FEE }
enum TransactionStatus { INCOMING, PENDING, COMPLETED, BLOCKED, FAILED }
enum TicketType { MANUAL_WITHDRAWAL, TIER_UPGRADE, FEE_ADJUSTMENT, SUPPORT }
enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED, REJECTED }
```

#### Tipos Customizados

```typescript
type LedgerStatus = 'INCOMING' | 'PENDING' | 'RESERVE' | 'AVAILABLE' | 'CLEARED' | 'AUDIT' | 'BLOCKED';
type UserRole = 'customer' | 'merchant' | 'super_merchant' | 'admin' | 'operator';
```

#### Modelos Principais

| Interface | Campos Chave | Notas |
|---|---|---|
| `Merchant` | `id, name, tier, reservePercent, apiKey` | Renomeada de Organization |
| `User` | `id, email, tier, status, wallets, transactions` | Perfil do utilizador |
| `Wallet` | `id, currency, balanceIncoming/Pending/Available/Blocked` | Balances por estado de settlement |
| `Transaction` | `id, type, status, amount, feeApplied, currency` | Historico completo |
| `FeeSchedule` | `tier, transactionType, percentageFee, fixedFee` | Tabela de taxas por tier |
| `SettlementBatch` | `batchNumber, totalAmount, currency, transactions` | Lotes de settlement |
| `OperationTicket` | `type, status, description, resolutionNotes` | Tickets de operacao |
| `PaymentMethod` | `network, label, enabled, currencies` | White-label: so mostra network |
| `PaymentLink` | `amount, currency, status, url, transactions, volume` | Links de cobranca |
| `ApiKey` | `keyPrefix, key, status, lastUsed, storeName` | API Keys S2S |
| `KycProfile` | `tier, data: { tier1, tier2, tier3 }` | Dados de verificacao |

#### API Request/Response

```typescript
interface LoginResponse {
  success: boolean;
  data: { merchantId: string; token: string; user: AuthUser };
}

interface XPaymentsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## 7. API Client & Integracao

### Cliente: `src/lib/api/client.ts`

Baseado em **Axios** com interceptors automaticos.

#### Caracteristicas

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` (ja inclui `/api/v1`)
- **JWT Auto-Inject**: Request interceptor injeta `Authorization: Bearer <token>` automaticamente
- **401 Handler**: Response interceptor limpa sessao e dispara evento `xp:unauthorized`
- **Token Storage**: `sessionStorage` (chaves: `xp_token`, `xp_user`)
- **Response Unwrap**: Todas as chamadas fazem unwrap de `{ success, data }` → retorna `data` diretamente
- **Timeout**: 30 segundos

#### Modulos API

| Modulo | Metodos | Endpoints |
|---|---|---|
| `xpApi.auth` | `login()`, `register()`, `me()` | `/auth/login`, `/auth/register`, `/auth/me` |
| `xpApi.public` | `getRates()` | `/public/rates` |
| `xpApi.wallets` | `list()`, `getById(id)` | `/wallets`, `/wallets/:id` |
| `xpApi.transactions` | `list(params)` | `/transactions` |
| `xpApi.deposits` | `create(data)` | `/deposits` |
| `xpApi.swaps` | `execute(data)` | `/swaps` |
| `xpApi.withdrawals` | `create(data)` | `/withdrawals` |
| `xpApi.kyc` | `getProfile()`, `upgrade(data)` | `/kyc/profile`, `/kyc/upgrade` |
| `xpApi.merchant` | `getApiKeys()`, `generateApiKey()`, `getPaymentLinks()`, `createPaymentLink()` | `/merchant/api-keys`, `/merchant/links` |
| `xpApi.tickets` | `list(params)`, `update(id, data)` | `/tickets`, `/tickets/:id` |
| `xpApi.organizations` | `list()` | `/organizations` |
| `xpApi.users` | `list(params)` | `/users` |
| `xpApi.dashboard` | `getWallets()`, `getTransactions(params)` | `/dashboard/wallets`, `/dashboard/transactions` |

#### Exemplo de Uso

```typescript
import { xpApi } from '@/lib/api/client';

// Login
const { token, user } = await xpApi.auth.login({ email, password });

// Listar wallets
const wallets = await xpApi.wallets.list();

// Criar payment link
const link = await xpApi.merchant.createPaymentLink({
  amount: 99.90,
  currency: 'BRL',
  description: 'Assinatura Premium'
});
```

---

## 8. Stores — Estado Global (Zustand)

### Auth Store (`src/stores/auth-store.ts`)

| Estado | Tipo | Descricao |
|---|---|---|
| `user` | `AuthUser \| null` | Utilizador autenticado |
| `token` | `string \| null` | JWT token |
| `isAuthenticated` | `boolean` | Flag de autenticacao |
| `isLoading` | `boolean` | Loading state |

| Acao | Descricao |
|---|---|
| `setAuth(token, user)` | Define sessao e persiste em sessionStorage |
| `updateUser(updates)` | Atualiza campos do utilizador |
| `logout()` | Limpa sessao (token + user) |
| `getUserRole()` | Retorna role atual (default: 'customer') |
| `isOperator()` | `true` se role === 'operator' |
| `isMerchant()` | `true` se role === 'merchant' \|\| 'super_merchant' \|\| 'customer' |

**Persistencia**: `sessionStorage` (chave: `xp-auth-storage`)

### Nav Store (`src/stores/nav-store.ts`)

| Estado | Tipo | Descricao |
|---|---|---|
| `currentPage` | `NavPage` | Pagina ativa do dashboard |
| `sidebarOpen` | `boolean` | Estado da sidebar |

**Paginas disponiveis**: `dashboard`, `wallets`, `deposits`, `swaps`, `withdrawals`, `transactions`, `kyc`, `admin-tickets`, `admin-users`, `admin-fees`, `admin-organizations`, `merchant-links`, `merchant-api-keys`, `merchant-checkouts`

### BaaS Store (`src/stores/baas-store.ts`)

Gestao de scope para **Account Managers** que visualizam dados de multiplos merchants.

| Estado | Tipo | Descricao |
|---|---|---|
| `scope.storeId` | `string \| null` | ID da store em foco |
| `scope.storeName` | `string \| null` | Nome da store em foco |
| `scope.userId` | `string \| null` | ID do utilizador da store |

**Persistencia**: `sessionStorage` (chave: `xp-baas-storage`)

---

## 9. RBAC & Permissoes

### Roles Disponiveis

| Role | Label | Descricao |
|---|---|---|
| `customer` | Customer | Utilizador final, sem organizacao |
| `merchant` | Merchant | Lojista com organizacao |
| `super_merchant` | Super Merchant | Merchant com sub-clientes |
| `admin` | Admin | Administrador completo do sistema |
| `operator` | Operator | Operador interno (equipa XPayments) |

### Matriz de Permissoes

| Permissao | customer | merchant | super_merchant | admin | operator |
|---|:---:|:---:|:---:|:---:|:---:|
| `canViewDashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `canViewWallets` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `canDeposit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `canSwap` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `canWithdraw` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `canViewTransactions` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `canGeneratePaymentLinks` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `canManageApiKeys` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `canConfigureCheckouts` | ❌ | ✅ | ✅ | ✅ | ❌ |
| `canViewSubClients` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `canManageTickets` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `canApproveKyc` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `canConfigureFees` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `canManageOrganizations` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `canManageUsers` | ❌ | ❌ | ❌ | ✅ | ✅ |

### Implementacao

A sidebar (`xp-sidebar.tsx`) usa `ROLE_PERMISSIONS[role]` para filtrar os itens de navegacao. Cada item tem uma propriedade `permission?: keyof RolePermissions` — se definida, o item so e visivel se a role atual tiver essa permissao.

---

## 10. Navegacao & View Routing

O dashboard usa **navegacao client-side via Zustand** em vez de file-system routing para as views internas.

### Fluxo

```
page.tsx (Client)
  |
  +-- !mounted? → Loading spinner (neon)
  |
  +-- !isAuthenticated? → <XPaymentsLanding />
  |     |
  |     +-- Login form → xpApi.auth.login() → setAuth() → dispatches 'xp:authenticated'
  |     +-- Register form → xpApi.auth.register() → setAuth() → dispatches 'xp:authenticated'
  |
  +-- isAuthenticated? → <XPaymentsSidebar /> + <Page />
        |
        +-- useNavStore().currentPage → PAGES[currentPage] || DashboardPage
```

### Views Disponiveis

| View | Componente | Acesso | Estado |
|---|---|---|---|
| Painel de Controle | `DashboardPage` | Todos | Completo |
| Carteiras | `WalletsPage` | Todos | Completo |
| Depositar | `DepositsPage` | customer+ | Completo |
| Swap | `SwapsPage` | customer+ | Completo |
| Sacar | `WithdrawalsPage` | customer+ | Completo |
| Transacoes | `TransactionsPage` | Todos | Completo |
| Verificacao KYC | `KycPage` | Todos | Completo |
| Links de Pagamento | `MerchantLinksPage` | merchant+ | Completo (API wired) |
| API Keys | `MerchantApiKeysPage` | merchant+ | Completo |
| Checkouts | `MerchantCheckoutsPage` | merchant+ | Completo (white-label) |
| Tickets / Operacoes | `AdminTicketsPage` | operator/admin | Completo |
| Utilizadores | `AdminUsersPage` | operator/admin | Completo |
| Taxas & Comissoes | `AdminFeesPage` | operator/admin | Completo |
| Organizacoes | `AdminOrganizationsPage` | operator/admin | Completo |

---

## 11. Modulo de Pagamentos — White-Label

### Regra de Ouro

**Nomes de providers de pagamento nunca sao expostos ao utilizador final.**

A UI mostra apenas:
- **Nome da rede** (Visa, Mastercard, MBWAY, PIX, USDT, BTC, Amex, Multibanco, Bizum)
- **Logo da rede** (icones SVG/IMG)
- **Moeda aceita** (EUR, BRL, USD)

### Redes Suportadas (White-Label)

| Rede | Moedas | Tipo |
|---|---|---|
| Visa | EUR, USD, BRL | Cartao de Credito/Debito |
| Mastercard | EUR, USD, BRL | Cartao de Credito/Debito |
| MBWAY | EUR | Mobile Payment (Portugal) |
| PIX | BRL | Instant Payment (Brasil) |
| USDT | USDT | Crypto (Tether) |
| BTC | BTC | Crypto (Bitcoin) |
| Amex | EUR, USD | Cartao de Credito |
| Multibanco | EUR | Referencia de Pagamento (Portugal) |
| Bizum | EUR | Mobile Payment (Espanha) |

### Payment Links

```typescript
interface PaymentLink {
  id: string;
  merchantId: string;
  amount: number;
  currency: Currency;           // 'EUR' | 'BRL' | 'USDT' | 'USD'
  description?: string;
  status: 'active' | 'expired' | 'cancelled';
  url: string;                  // https://pay.xpayments.digital/l/...
  transactions: number;         // Contagem de pagamentos
  volume: number;               // Volume total processado
  createdAt: string;
}
```

### API Keys (S2S)

```typescript
interface ApiKey {
  id: string;
  merchantId: string;
  storeName: string;
  keyPrefix: string;            // "xp_live_..."
  key: string;                  // Chave completa (mostrada apenas na criacao)
  status: 'active' | 'revoked';
  lastUsed?: string;
  createdAt: string;
}
```

---

## 12. Motor de Estados (Settlement)

```
                    +----------+
                    | INCOMING |  ← Pagamento recebido, aguarda processamento
                    +----+-----+
                         |
                         v
                    +----------+
               +--->| PENDING  |  ← Em transito (D+1 a D+3)
               |    +----+-----+
               |         |
               |         v
               |    +-----------+
               |    | AVAILABLE |  ← Pronto para sacar (USDT)
               |    +----+------+
               |         |
               |         v
               |    +----------+
               |    | CLEARED  |  ← Payout concluido
               |    +----------+
               |
               |    +----------+
               +----| RESERVE  |  ← Bloqueado por compliance
                    +----+-----+
                         |
                    +----+-----+
                    v          v
              +----------+ +----------+
              |  AUDIT   | | BLOCKED  |
              +----------+ +----------+
```

| Estado | API Key | Cor | Descricao |
|---|---|---|---|
| Incoming | `INCOMING` | Slate | Pagamento recebido, aguarda processamento |
| Pending | `PENDING` | Amber | Fundos em transito D+1 a D+3 |
| Risk Reserve | `RESERVE` | Red | Retido por compliance/KYC/AML |
| Available | `AVAILABLE` | Neon Green | Pronto para payout em USDT |
| Cleared | `CLEARED` | Neon | Payout ja realizado |
| Under Audit | `AUDIT` | Cyan | Em revisao manual |
| Blocked | `BLOCKED` | Red | Fundos bloqueados permanentemente |

### Type LedgerStatus

```typescript
type LedgerStatus = 'INCOMING' | 'PENDING' | 'RESERVE' | 'AVAILABLE' | 'CLEARED' | 'AUDIT' | 'BLOCKED';
```

---

## 13. Data Flow

```
+------------------+     +--------------------+     +-----------------------+
|  page.tsx        |---->| useNavStore        |---->| View Router (switch)  |
|  (Client)        |     |   (Zustand)        |     |                       |
+------------------+     +--------------------+     +----------+------------+
                                                               |
              +------------------------------------------------+--------------------+
              v                                                v                    v
     +-----------------+  +------------------------+  +------------------+  +------------------+
     | DashboardPage   |  | WalletsPage            |  | MerchantLinksPage|  | AdminTicketsPage |
     |                 |  |                        |  |                  |  |                  |
     | xpApi.dashboard |  | xpApi.wallets.list()   |  | xpApi.merchant   |  | xpApi.tickets    |
     |       |         |  |       |                |  | .getPaymentLinks |  | .list()          |
     |       v         |  |       v                |  |       |          |  |       |          |
     | BalanceCards    |  | WalletTable            |  | DataTable+Sheet  |  | TicketsTable     |
     +-----------------+  +------------------------+  +------------------+  +------------------+
```

### Fluxo de Refresh

1. **Inicial**: Mount → `useQuery` faz fetch imediato
2. **Background Sync**: A cada 30s, React Query refaz o GET automaticamente
3. **Focus**: Quando o user volta ao tab, refetch automatico
4. **Manual**: Botao de refresh ou "Retry" no estado de erro
5. **401 Handler**: Response interceptor dispara `xp:unauthorized` → limpa sessao → mostra login

### Eventos Customizados

| Evento | Quando | Acao |
|---|---|---|
| `xp:authenticated` | Login/Register bem-sucedido | Navega para dashboard |
| `xp:logout` | Logout explicito | Navega para landing |
| `xp:unauthorized` | 401 da API | Limpa sessao, mostra login |

---

## 14. Componentes do Dashboard

### Layout Principal (`page.tsx`)

| Feature | Detalhe |
|---|---|
| Auth Guard | Verifica `isAuthenticated` do `useAuthStore` |
| Loading State | Spinner neon ate hydration |
| Header | Sticky com titulo da pagina + badge "XPayments v2.0" |
| Content Area | `ScrollArea` com `p-4 sm:p-6 lg:p-8` |
| Error Boundary | `PageErrorBoundary` em volta de cada view |

### Sidebar (`xp-sidebar.tsx`)

| Feature | Detalhe |
|---|---|
| Colapsavel | Sim, toggle via botao ou `Ctrl/Cmd + B` |
| RBAC | Items filtrados por `ROLE_PERMISSIONS[role]` |
| Mobile | Abre como Sheet (bottom drawer) |
| Seccoes | Financeiro, Merchant, Administracao (condicional por role) |
| Footer | Nome do user + role badge + botao logout |

### Landing Page (`xp-landing.tsx`)

| Feature | Detalhe |
|---|---|
| Design | Grid neon animado + sweep effects |
| Login | Formulario com email + password → `xpApi.auth.login()` |
| Register | Formulario com email + password + store name → `xpApi.auth.register()` |
| Dev Mode | Botao "Entrar em Modo Dev" para bypass de autenticacao |
| Marquee | Logos de redes de pagamento (white-label) |

---

## 15. Variaveis de Ambiente

### `.env.example` (commit to repo)

```env
# Production API (required)
NEXT_PUBLIC_API_URL="https://api.xpayments.digital"

# Authentication (uncomment when auth flow is ready)
# NEXTAUTH_SECRET=""
# NEXTAUTH_URL="https://app.xpayments.digital"

# Database (Prisma/SQLite local — only for dev)
# DATABASE_URL="file:./db/custom.db"
```

### Configuracao na Vercel

| Key | Valor | Ambientes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.xpayments.digital` | Production, Preview, Development |

> **Nota**: `NEXT_PUBLIC_*` e exposta ao browser. Para dados sensiveis (JWT), usar Server Components ou API routes. O JWT e armazenado em `sessionStorage` via API client, nunca em env vars.

---

## 16. Deploy — Vercel

### Configuracao (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  output: "standalone",        // Para Vercel + Docker
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};
```

### Passo-a-Passo

1. **Push** para o repositorio:
   ```
   https://github.com/nexflowx-hub/app.xpayments.digital
   ```

2. **Importar na Vercel**:
   - Aceder a [vercel.com/new](https://vercel.com/new)
   - Selecionar o repositorio `nexflowx-hub/app.xpayments.digital`
   - Framework Preset: **Next.js** (detectado automaticamente)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default para standalone)

3. **Configurar Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://api.xpayments.digital`
   - Disponivel em **Production**, **Preview** e **Development**

4. **Deploy automatico** em cada push para `main`.

### Dominio Customizado

1. Vercel Dashboard → **Settings → Domains**
2. Adicionar `app.xpayments.digital`
3. Configurar DNS: **CNAME**: `app` → `cname.vercel-dns.com`

---

## 17. Setup & Desenvolvimento

### Pre-requisitos

- **Bun** (runtime + package manager) — [bun.sh](https://bun.sh)
- **Node.js** 18+ (alternativa ao Bun)
- **Git**

### Instalacao

```bash
# Clonar
git clone https://github.com/nexflowx-hub/app.xpayments.digital.git
cd app.xpayments.digital

# Instalar dependencias
bun install

# Copiar variaveis de ambiente
cp .env.example .env.local

# (Opcional) Gerar cliente Prisma para dev local
bun run db:generate
bun run db:push

# Iniciar servidor de desenvolvimento
bun run dev
```

O servidor arranca em `http://localhost:3000`.

### Scripts

| Script | Comando | Descricao |
|---|---|---|
| `dev` | `next dev -p 3000` | Servidor de desenvolvimento |
| `build` | `next build + cp statics` | Build de producao (standalone) |
| `start` | `NODE_ENV=production bun .next/standalone/server.js` | Servidor de producao |
| `lint` | `eslint .` | Verificacao de qualidade de codigo |
| `db:push` | `prisma db push` | Push schema para DB local |
| `db:generate` | `prisma generate` | Gerar Prisma Client |
| `db:migrate` | `prisma migrate dev` | Criar migration |
| `db:reset` | `prisma migrate reset` | Reset da DB |

---

## 18. Convencoes de Codigo

### Imports (ordem)

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

// 3. shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// 4. Project components
import { XPaymentsSidebar } from '@/components/layout/xp-sidebar';

// 5. Stores, hooks, types
import { useAuthStore } from '@/stores/auth-store';
import type { Wallet, Currency } from '@/types/xpayments';
```

### Nomenclatura

| Elemento | Convencao | Exemplo |
|---|---|---|
| Ficheiros | `kebab-case.tsx` | `merchant-links-page.tsx` |
| Componentes | `PascalCase` | `MerchantLinksPage` |
| Hooks | `use-kebab-case.ts` | `use-mobile.ts` |
| Tipos/Interfaces | `PascalCase` | `PaymentLink`, `LedgerStatus` |
| Enums | `UPPER_SNAKE_CASE` | `TransactionStatus` |
| Constants | `UPPER_SNAKE_CASE` | `ROLE_LABELS` |
| CSS tokens | `--kebab-case` | `--color-neon-400` |
| Stores | `use-kebab-store.ts` | `use-auth-store.ts` |

### Tailwind

- **Cores**: Usar `neon-*` para acentos, `zinc-*` para neutrals. Nunca usar `blue`, `indigo`, `emerald`, `teal`.
- **Texto secundario**: `text-muted-foreground`
- **Fundos**: `bg-card`, `bg-background`
- **Bordas**: `border-border`
- **Glow**: `text-neon-glow`, `bg-neon-glow`, `border-neon-glow`

### White-Label

- NUNCA exibir nomes de providers (Stripe, MisticPay, Onramp.Money, Ghost Middleware)
- Usar apenas nomes de redes (Visa, PIX, MBWAY, USDT) e logos
- Prefixos de IDs: usar `xp_` em vez de `pi_` ou `cs_`

---

## 19. Roadmap

### v2.0.0 — Sprint Actual (Atual)

- [x] Rebranding completo: Atlas Global Core → XPayments.Digital
- [x] Design System: Dark Control Tower + Verde Neon (#00FF7F)
- [x] Type System: `xpayments.ts` alinhado ao Prisma Schema
- [x] API Client: Axios com JWT interceptors + unwrap pattern
- [x] Auth Store: Zustand + sessionStorage persist
- [x] RBAC: 5 roles com matriz de permissoes
- [x] 14 paginas do dashboard (wallet, deposit, swap, withdraw, transactions, KYC, etc.)
- [x] Sidebar com RBAC filtering
- [x] Landing page com login/register API real
- [x] White-label compliance: zero provider names na UI
- [x] PT-BR completo em toda a interface
- [x] Payment Links: API wired (listar + criar)
- [x] API Keys: Gestao completa
- [x] Checkouts: Configuracao white-label com logos de redes
- [x] Vercel deployment configuration
- [x] GitHub repository: `nexflowx-hub/app.xpayments.digital`

### Proximo Sprint (v2.1.0)

- [ ] Dashboard com graficos de volume (Recharts)
- [ ] Historico de transacoes com filtros avancados
- [ ] Payout/Withdrawal com ticket system
- [ ] Customers/CRM (LTV, historico individual)
- [ ] Store Settings (branding, webhooks, cores)
- [ ] Real-time updates via WebSocket/Socket.io
- [ ] 2FA (TOTP) para seguranca

### Futuro (v3.0.0)

- [ ] Multi-language (EN, ES, PT)
- [ ] Export CSV/Excel de transacoes
- [ ] Mobile-responsive hosted checkout
- [ ] Webhook configuration UI
- [ ] Audit log completo
- [ ] Dark/Light mode toggle (se requisitado)

---

## 20. Licenca

Propriedade privada. Todos os direitos reservados — XPayments.Digital (c) 2025-2026.

---

<div align="center">

**XPayments.Digital** — A ponte entre o sistema financeiro tradicional e a economia digital.

[app.xpayments.digital](https://app.xpayments.digital) | [api.xpayments.digital](https://api.xpayments.digital)

</div>