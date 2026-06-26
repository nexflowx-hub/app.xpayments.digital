<div align="center">

# XPayments.Digital v3.0

**Super App Financeira — Gateway de Pagamentos + Business Account**

*A ponte entre o sistema financeiro tradicional e a economia digital.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Instalável-9B59B6?style=flat-square&logo=pwa)](#12-pwa--progressive-web-app)

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XPaymentsDigital/xpayments-digital.git&env=NEXT_PUBLIC_API_URL,https://api.xpayments.digital)

</div>

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Arquitetura SPA](#4-arquitetura-spa)
5. [API Client](#5-api-client)
6. [Sistema de Tipos TypeScript](#6-sistema-de-tipos-typescript)
7. [RBAC & Permissões](#7-rbac--permissões)
8. [Sistema de Navegação](#8-sistema-de-navegação)
9. [KYC & Taxas](#9-kyc--taxas)
10. [PWA — Progressive Web App](#10-pwa--progressive-web-app)
11. [Design System — Dark Control Tower v3.0](#11-design-system--dark-control-tower-v30)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)
13. [Scripts](#13-scripts)
14. [Deploy](#14-deploy)
15. [Roadmap v4.0](#15-roadmap-v40)

---

## 1. Visão Geral

O **XPayments.Digital** é uma **Super App Financeira** que combina as funcionalidades de um **Gateway de Pagamentos White-Label** e uma **Business Account** institucional, operando como a ponte entre o sistema financeiro tradicional e a economia digital.

### Funcionalidades Principais

- **Carteiras Multi-Moeda** — Wallets em EUR, BRL e USDT com saldos segregados por estado (`incoming`, `pending`, `available`, `blocked`)
- **Gateway White-Label** — Payment links, API Keys S2S, checkouts personalizados e catálogo de produtos para merchants
- **Settlement Automatizado** — Liquidação de recebimentos com timeline progressiva (T+3 a T+0) conforme o nível de verificação
- **Operações Cross-Border** — PIX (BRL), SEPA (EUR), USDT (TRC-20) com conversão automática via swap
- **PWA Instalável** — Progressive Web App com Service Worker, cache inteligente e install prompt nativo
- **AI Assistente Integrado** — Chatbot flutuante com integração a modelos de linguagem (OpenRouter/GPT)
- **KYC Progressivo** — 4 tiers de verificação com limites, taxas e funcionalidades progressivas
- **RBAC Granular** — 5 roles com matriz de 15 permissões para controle fino de acesso

### Zero Mock Data

Todas as páginas do dashboard estão conectadas à API real. Não existem dados simulados no fluxo principal — quando a API não retorna dados, a UI exibe estados vazios adequados.

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão | Detalhes |
|--------|-----------|--------|----------|
| **Framework** | Next.js (App Router) | 16.x | SPA mode, standalone output |
| **UI Library** | React | 19.x | Concurrent features |
| **Linguagem** | TypeScript | 5.x | Strict mode |
| **Estilização** | Tailwind CSS | 4.x | Dark theme, custom neon brand |
| **Componentes** | shadcn/ui | New York | 49+ componentes |
| **Estado Global** | Zustand | 5.x | 4 stores (auth, nav, baas, chat) |
| **ORM** | Prisma | 6.x | SQLite (desenvolvimento) |
| **Animação** | Framer Motion | 12.x | Transições e micro-interações |
| **Ícones** | Lucide React | 0.525+ | Conjunto completo |
| **Temas** | next-themes | 0.4.x | Dark mode por padrão |
| **Toasts** | Sonner | 2.x | Rich colors, top-right |
| **Gráficos** | Recharts | 2.x | Dashboard charts |
| **Tabelas** | @tanstack/react-table | 8.x | Data tables avançadas |
| **Forms** | React Hook Form + Zod | 7.x / 4.x | Validação tipo-safe |
| **HTTP Client** | Fetch (native) | — | Wrapper próprio com JWT |
| **Runtime** | Bun | latest | Dev server e scripts |
| **PWA** | Service Worker + Manifest | v3 | Cache versionado |
| **Output** | Standalone | — | Docker / VPS ready |

---

## 3. Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Root layout (SEO, PWA, Theme, JSON-LD, Fonts)
│   ├── page.tsx                # SPA entry — auth guard → landing / dashboard shell
│   ├── globals.css             # Design system, animações, brand colors neon
│   ├── sitemap.ts              # SEO sitemap dinâmico
│   ├── robots.ts               # SEO robots.txt dinâmico
│   └── api/
│       ├── route.ts            # Health check raiz
│       ├── binance/route.ts    # Proxy para ticker público Binance
│       ├── ai/chat/route.ts    # Proxy AI chat → Backend OpenRouter
│       └── health/route.ts     # Health endpoint dedicado
├── components/
│   ├── layout/
│   │   ├── xp-landing.tsx      # Landing page + formulário login/register
│   │   └── xp-sidebar.tsx      # Sidebar colapsável com RBAC filtering
│   ├── dashboard/              # 12 componentes de página
│   │   ├── dashboard-page.tsx  # Painel principal (wallets + transações)
│   │   ├── admin-dashboard-page.tsx  # Super Admin overview
│   │   ├── admin-tickets-page.tsx    # Tickets / Operações
│   │   ├── admin-users-page.tsx      # Gestão de utilizadores
│   │   ├── admin-fees-page.tsx       # Taxas & Comissões
│   │   ├── admin-organizations-page.tsx  # Gestão de organizações
│   │   ├── merchant-links-page.tsx    # Links de pagamento
│   │   ├── merchant-api-keys-page.tsx # Gestão de API Keys
│   │   ├── merchant-checkouts-page.tsx # Gestão de checkouts
│   │   ├── merchant-catalog-page.tsx  # Catálogo de produtos
│   │   └── merchant-api-docs-page.tsx # Documentação da API
│   ├── wallet/                 # 5 páginas de wallet
│   │   ├── wallets-page.tsx    # Visão geral das carteiras
│   │   ├── deposits-page.tsx   # Depósitos (3 etapas: método → detalhes → confirmação)
│   │   ├── swaps-page.tsx      # Swap entre moedas
│   │   ├── payouts-page.tsx    # Payouts (USDT → EUR/BRL/USDT)
│   │   └── transactions-page.tsx # Histórico de transações
│   ├── kyc/
│   │   └── kyc-page.tsx        # Verificação KYC 4-tier com taxas
│   ├── ai/
│   │   └── xp-ai-chat.tsx      # Chat widget flutuante
│   ├── pwa/
│   │   ├── pwa-register.tsx    # Auto-registo do service worker
│   │   └── pwa-install-prompt.tsx  # Banner de instalação PWA
│   ├── shared/
│   │   ├── crypto-cards.tsx    # Ticker tape + cards de cripto
│   │   └── animated-grid-bg.tsx # Canvas particle system
│   └── ui/                     # 49 componentes shadcn/ui (New York)
├── stores/                     # 4 stores Zustand
│   ├── auth-store.ts           # Auth state + RBAC permissions matrix
│   ├── nav-store.ts            # Navegação SPA (currentPage + sidebar)
│   ├── chat-store.ts           # Chat AI state (messages, isOpen, loading)
│   └── baas-store.ts           # Estado auxiliar BaaS
├── hooks/
│   ├── use-mobile.ts           # Detecção de breakpoint mobile
│   └── use-toast.ts            # Hook legacy (Sonner é o padrão)
├── lib/
│   ├── api/
│   │   └── client.ts           # Fetch wrapper + xpApi + XPaymentsApiError
│   ├── formatting.ts           # Helpers de exibição (símbolos, labels, cores)
│   ├── db.ts                   # Cliente Prisma
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── types/
│   ├── index.ts                # Re-exports
│   └── xpayments.ts            # Todos os tipos, enums e interfaces
└── providers/
    ├── theme-provider.tsx      # next-themes (dark por padrão)
    └── index.ts                # Barrel export

public/
├── manifest.json               # PWA manifest completo
├── sw.js                       # Service worker com cache versionado
├── offline.html                # Fallback offline
├── icons/
│   ├── icon-192.png            # PWA icon 192×192
│   └── icon-512.png            # PWA icon 512×512 + maskable
├── logo.png / logo.svg
├── favicon.ico
├── apple-touch-icon.png
└── og-image.png
```

---

## 4. Arquitetura SPA

O XPayments.Digital utiliza um padrão **Single-Route SPA** — toda a aplicação é servida a partir da rota `/`, com roteamento de views inteiramente no cliente.

### Como Funciona

```
                    ┌──────────────────────────────┐
                    │   src/app/page.tsx (única)   │
                    │   Rota: /                    │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │  useAuthStore.isAuthenticated │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │ false                             │ true
              ▼                                   ▼
    ┌─────────────────┐              ┌─────────────────────────┐
    │ XPaymentsLanding │              │ useNavStore.currentPage │
    │ (Login/Register) │              └──────────┬──────────────┘
    └─────────────────┘                         │
                                      ┌─────────▼──────────┐
                                      │ PAGES[page] → <Page│
                                      │ (mapa de 18 views) │
                                      └────────────────────┘
```

### Componentes-Chave

1. **`page.tsx`** — Ponto de entrada único (`/`). Verifica autenticação e renderiza a Landing ou o Dashboard Shell
2. **`useNavStore.currentPage`** — Estado Zustand que controla qual "página" está visível
3. **`PAGES` map** — Objeto `Record<string, React.ComponentType>` que mapeia 18 chaves de navegação para componentes React
4. **`TITLES` map** — Títulos de cada página exibidos na top bar

### 18 Views SPA

| Chave | Componente | Título |
|-------|-----------|--------|
| `admin-dashboard` | `AdminDashboardPage` | Super Admin Overview |
| `dashboard` | `DashboardPage` | Painel de Controle |
| `wallets` | `WalletsPage` | Carteiras |
| `deposits` | `DepositsPage` | Depositar |
| `swaps` | `SwapsPage` | Swap |
| `payouts` | `PayoutsPage` | Payouts |
| `transactions` | `TransactionsPage` | Transações |
| `kyc` | `KycPage` | Verificação KYC |
| `admin-tickets` | `AdminTicketsPage` | Tickets / Operações |
| `admin-users` | `AdminUsersPage` | Utilizadores |
| `admin-fees` | `AdminFeesPage` | Taxas & Comissões |
| `admin-organizations` | `AdminOrganizationsPage` | Organizações |
| `merchant-links` | `MerchantLinksPage` | Links de Pagamento |
| `merchant-api-keys` | `MerchantApiKeysPage` | API Keys |
| `merchant-checkouts` | `MerchantCheckoutsPage` | Checkouts |
| `merchant-catalog` | `MerchantCatalogPage` | Catálogo de Produtos |
| `merchant-api-docs` | `MerchantApiDocsPage` | Documentação API |

### Transições de Página

Cada troca de view utiliza a animação CSS `animate-page-enter` (definida em `globals.css`):

```css
@keyframes page-enter {
  from { opacity: 0; transform: translateY(6px) scale(0.995); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-page-enter { animation: page-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

O `key={currentPage}` no wrapper garante que o React re-monta o componente, acionando a animação a cada navegação.

---

## 5. API Client

O client HTTP é implementado em `src/lib/api/client.ts` utilizando **`fetch` nativo** (sem Axios), com um wrapper centralizado.

### Arquitetura do Client

```
┌─────────────────────────────────────────────────┐
│                 xpApi.<module>.<method>()        │
│            (get / post / put / patch / del)     │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              request<T>(path, options)           │
│  ┌─────────────────────────────────────────┐    │
│  │ 1. Lazy import useAuthStore (avoid circ) │    │
│  │ 2. Lê JWT → Authorization: Bearer <token>│    │
│  │ 3. Constrói URL: API_V1 + path          │    │
│  │ 4. fetch() com headers                   │    │
│  │ 5. 401 → clear session + logout + event  │    │
│  │ 6. !ok → XPaymentsApiError               │    │
│  │ 7. Unwrap { success, data } → return T   │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Características

- **JWT Injection** — O token é lido diretamente do Zustand store (`useAuthStore.getState().token`) e injetado no cabeçalho `Authorization: Bearer <token>`
- **Auto-prefixo `/api/v1`** — O `NEXT_PUBLIC_API_URL` não inclui `/api/v1`; o client adiciona automaticamente
- **Envelope unwrap** — O backend retorna `{ success: boolean, data: T }`; o client extrai e retorna `data`
- **Auto 401** — Em resposta 401, limpa sessão (token + user do sessionStorage), dispara `logout()` no store e emite evento global `xp:unauthorized`
- **Lazy import** — O `useAuthStore` é importado dentro de `request()` para evitar dependências circulares (o auth-store importa helpers de storage deste ficheiro)
- **XPaymentsApiError** — Erro customizado com `status`, `code` e `details`

### Mapeamento Completo de Endpoints

#### AUTH

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| POST | `/auth/login` | `xpApi.auth.login()` | Login de Merchant/Lojista |
| POST | `/auth/register` | `xpApi.auth.register()` | Registo de novo Merchant |
| GET | `/auth/me` | `xpApi.auth.me()` | Dados do utilizador autenticado |

#### ADMIN

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| POST | `/admin/login` | `xpApi.admin.login()` | Login de Admin/Operador |
| GET | `/admin/stats` | `xpApi.admin.getStats()` | Super Admin dashboard stats |
| GET | `/admin/merchants` | `xpApi.admin.getMerchants()` | Listar todos os merchants |

#### WALLETS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/wallets` | `xpApi.wallets.list()` | Listar carteiras do utilizador |
| GET | `/wallets/:id` | `xpApi.wallets.getById()` | Obter carteira por ID |

#### TRANSACTIONS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/transactions` | `xpApi.transactions.list()` | Listar transações (filtros: walletId, type, status, page, pageSize) |

#### DEPOSITS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| POST | `/deposits` | `xpApi.deposits.create()` | Criar depósito |
| POST | `/deposits/:id/proof` | `xpApi.deposits.submitProof()` | Submeter comprovativo (tx_hash ou receipt) |

#### SWAPS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| POST | `/swaps` | `xpApi.swaps.execute()` | Executar swap entre carteiras |

#### PAYOUTS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| POST | `/payouts` | `xpApi.payouts.create()` | Criar payout (amountUSDT, requestedCurrency, destinationInfo) |

#### KYC

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/kyc/profile` | `xpApi.kyc.getProfile()` | Obter perfil KYC do utilizador |
| POST | `/kyc/upgrade` | `xpApi.kyc.upgrade()` | Solicitar upgrade de tier |

#### MERCHANT

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/merchant/:merchantId/dashboard` | `xpApi.merchant.getDashboard()` | Saldos Ledger Engine do Merchant |
| GET | `/merchant/:merchantId/transactions` | `xpApi.merchant.getTransactions()` | Transações recentes do Merchant |
| GET | `/merchant/api-keys` | `xpApi.merchant.getApiKeys()` | Listar API Keys |
| DELETE | `/merchant/api-keys/:id` | `xpApi.merchant.deleteApiKey()` | Eliminar API Key |
| POST | `/merchant/api-keys/generate` | `xpApi.merchant.generateApiKey()` | Gerar nova API Key |
| GET | `/merchant/links` | `xpApi.merchant.getPaymentLinks()` | Listar links de pagamento |
| POST | `/merchant/links` | `xpApi.merchant.createPaymentLink()` | Criar link de pagamento |
| GET | `/merchant/:merchantId/stores` | `xpApi.merchant.getStores()` | Listar lojas/checkouts |
| POST | `/merchant/:merchantId/stores` | `xpApi.merchant.createStore()` | Criar nova loja/checkout |
| GET | `/merchant/products` | `xpApi.merchant.getProducts()` | Listar produtos |
| POST | `/merchant/products` | `xpApi.merchant.createProduct()` | Criar produto |
| PUT | `/merchant/products/:id` | `xpApi.merchant.updateProduct()` | Atualizar produto |
| DELETE | `/merchant/products/:id` | `xpApi.merchant.deleteProduct()` | Eliminar produto |

#### TICKETS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/tickets` | `xpApi.tickets.list()` | Listar tickets (filtros: status, type, page) |
| PATCH | `/tickets/:id` | `xpApi.tickets.update()` | Atualizar ticket (status, resolutionNotes) |

#### ORGANIZATIONS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/organizations` | `xpApi.organizations.list()` | Listar organizações |

#### USERS

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/users` | `xpApi.users.list()` | Listar utilizadores (filtro: page) |

#### DASHBOARD

| Método | Rota | Função | Descrição |
|--------|------|--------|-----------|
| GET | `/dashboard/wallets` | `xpApi.dashboard.getWallets()` | Wallets agregados do dashboard |
| GET | `/dashboard/transactions` | `xpApi.dashboard.getTransactions()` | Transações do dashboard (filtro: limit) |

---

## 6. Sistema de Tipos TypeScript

Todos os tipos são definidos em `src/types/xpayments.ts` como **fonte da verdade**, baseados no Prisma Schema do backend.

### Enums

| Enum | Valores |
|------|---------|
| `TierLevel` | `TIER_0_UNVERIFIED`, `TIER_1_BASIC`, `TIER_2_VERIFIED`, `TIER_3_CORPORATE` |
| `Currency` | `EUR`, `BRL`, `USDT`, `USD` |
| `TransactionType` | `PROXY_INCOMING`, `SETTLEMENT`, `PAYOUT`, `SWAP`, `TRANSFER`, `FEE` |
| `TransactionStatus` | `INCOMING`, `PENDING`, `COMPLETED`, `BLOCKED`, `FAILED` |
| `AccountStatus` | `ACTIVE`, `SUSPENDED`, `BLOCKED` |
| `UserRole` | `customer`, `merchant`, `super_merchant`, `admin`, `operator` |
| `OrgRole` | `ADMIN`, `OPERATOR`, `ACCOUNT_MANAGER` |
| `TicketType` | `MANUAL_WITHDRAWAL`, `TIER_UPGRADE`, `FEE_ADJUSTMENT`, `SUPPORT` |
| `TicketStatus` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| `PayoutStatus` | `PENDING`, `PROCESSING`, `COMPLETED`, `REJECTED`, `CANCELLED` |

### Modelos Principais

| Interface | Descrição |
|-----------|-----------|
| `Merchant` | Conta de merchant com tier, reservePercent e relações |
| `User` | Utilizador com tier, status, wallets e transações |
| `Wallet` | Carteira com saldos segregados (incoming, pending, available, blocked) |
| `Transaction` | Transação com tipo, status, amount, fee, currency e batch |
| `FeeSchedule` | Taxa por tier e tipo de transação (percentageFee + fixedFee) |
| `SettlementBatch` | Lote de settlement com batchNumber e totalAmount |
| `PaymentLink` | Link de pagamento com amount, currency, status e métricas |
| `ApiKey` | Chave API S2S com keyPrefix, status e lastUsed |
| `Product` | Produto do catálogo com priceFiat, images e store |
| `OperationTicket` | Ticket de operação com type, status e resolutionNotes |
| `OrgOperator` | Operador interno da organização |

### Tipos de API

| Interface | Descrição |
|-----------|-----------|
| `XPaymentsApiResponse<T>` | Envelope padrão: `{ success: boolean, data: T, message?: string }` |
| `PaginatedResponse<T>` | Resposta paginada: `{ data, total, page, pageSize, totalPages }` |
| `LoginRequest` | `{ xpId?, email?, password }` |
| `LoginResponse` | `{ success, data: { merchantId, token, user: AuthUser } }` |
| `AuthUser` | Dados do utilizador autenticado com role e tier |
| `PayoutRequest` | `{ amountUSDT, requestedCurrency, destinationInfo, status? }` |
| `DepositProofRequest` | `{ depositId, proofType: 'tx_hash' \| 'receipt', proofValue }` |
| `KycProfile` | Perfil KYC com dados por tier |
| `TierLimits` | Limites por tier (maxTx, daily, monthly, currencies, features) |
| `RolePermissions` | Interface com 15 flags de permissão booleanas |

---

## 7. RBAC & Permissões

O sistema de controle de acesso é baseado em **5 roles** com uma **matriz de 15 permissões** definida em `src/stores/auth-store.ts`.

### Matriz de Permissões

| Permissão | Customer | Merchant | Super Merchant | Admin | Operator |
|-----------|:--------:|:--------:|:--------------:|:-----:|:--------:|
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

### Roles

- **`customer`** — Acesso básico: dashboard, wallets, depósitos, swaps, payouts, transações, KYC
- **`merchant`** — Tudo do customer + ferramentas de merchant (payment links, API keys, checkouts, catálogo)
- **`super_merchant`** — Tudo do merchant + visualização de sub-clientes
- **`admin`** — Acesso total a todas as funcionalidades
- **`operator`** — Operador interno: dashboard, wallets (somente leitura), transações, tickets, KYC, taxas, organizações, utilizadores

### Como Funciona

A role é lida do payload JWT no momento do login. A sidebar filtra os itens de navegação com base na role do utilizador e nas permissões configuradas na constante `ROLE_PERMISSIONS`.

```typescript
// Exemplo de uso em componentes
const { user } = useAuthStore();
const role = user?.role ?? 'customer';
const perms = ROLE_PERMISSIONS[role];

if (perms.canManageApiKeys) {
  // renderizar seção de API Keys
}
```

---

## 8. Sistema de Navegação

A navegação é gerida pelo store `useNavStore` (`src/stores/nav-store.ts`) e pela sidebar (`src/components/layout/xp-sidebar.tsx`).

### Store de Navegação

```typescript
interface NavState {
  currentPage: NavPage;   // Página atual exibida
  sidebarOpen: boolean;   // Sidebar expandida/colapsada (desktop)
  setPage: (page: NavPage) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}
```

### Sidebar — Seções Colapsáveis

A sidebar organiza os itens de navegação em **6 seções** colapsáveis, com RBAC filtering por role e permissão:

| Seção | Label | Páginas |
|-------|-------|---------|
| **Dashboard** | — | Painel (todos) |
| **WALLET** | `WALLET` | Carteiras, Depositar, Swap, Payouts |
| **VERIFICAÇÃO** | `VERIFICAÇÃO` | Verificação KYC |
| **E-COMMERCE & VENDAS** | `E-COMMERCE & VENDAS` | Transações, Checkouts, Links de Pagamento, Catálogo |
| **DEVELOPERS** | `DEVELOPERS` | API Keys, API Docs |
| **ADMIN** | `ADMIN` | Admin Overview, Aprovações, Liquidez, Utilizadores, Organizações |

### Navegação Mobile (PWA-style)

Em ecrãs mobile (`< md`), a sidebar é substituída por:

1. **Bottom Navigation Bar** — Barra fixa inferior com 4 itens rápidos + botão "Mais":
   - Painel (LayoutDashboard)
   - Carteiras (Wallet)
   - Transações (Receipt)
   - KYC (ShieldCheck)
   - Mais (Menu) → abre sidebar como overlay
2. **Safe area** — Respeita `env(safe-area-inset-bottom)` para dispositivos iOS
3. **Overlay** — Fundo escuro com backdrop-blur ao abrir a sidebar

### Estado do Sidebar (Desktop)

- **Expandido**: `w-[260px]` — Mostra ícones, labels, seções colapsáveis e footer completo
- **Colapsado**: `w-[68px]` — Mostra apenas ícones com tooltips no hover
- **Toggle**: Botão de chevron no fundo da sidebar

---

## 9. KYC & Taxas

O sistema de verificação KYC é progressivo, com **4 tiers** que desbloqueiam funcionalidades, limites e taxas progressivamente.

### Tiers de Verificação

| Tier | Nome | Limite por Tx | Limite Diário | Limite Mensal | Moedas | Settlement |
|------|------|:-------------:|:-------------:|:-------------:|--------|:----------:|
| **TIER 0** | Não Verificado | €250 | €1.000 | €5.000 | EUR, BRL, USDT | T+3 |
| **TIER 1** | Básico | €2.500 | €10.000 | €50.000 | EUR, BRL, USDT | T+2 |
| **TIER 2** | Verificado | €25.000 | €100.000 | €500.000 | EUR, BRL, USDT, USD | T+1 |
| **TIER 3** | Corporativo | €250.000 | €1.000.000 | €10.000.000 | EUR, BRL, USDT, USD | T+0 |

### Documentos Necessários por Tier

| Tier | Documentos |
|------|-----------|
| **TIER 0** | Email, Senha |
| **TIER 1** | Nome Completo, XPayments ID, Região (EU/BR), Contacto |
| **TIER 2** | NIF/CPF/TIN, Data de Nascimento, Morada Completa, Código Postal |
| **TIER 3** | Verificação Externa, Documento de Identidade, Proof of Address |

### Taxas por Tier

| Operação | TIER 0 | TIER 1 | TIER 2 | TIER 3 |
|----------|:------:|:------:|:------:|:------:|
| **Recebimentos PIX** | 3.50% + €0.50 | 2.80% + €0.30 | 2.00% + €0.20 | 1.20% + €0.10 |
| **Recebimentos SEPA** | 2.80% + €1.00 | 2.20% + €0.70 | 1.50% + €0.50 | 0.90% + €0.30 |
| **Recebimentos USDT** | 1.50% + €0.25 | 1.20% + €0.15 | 0.80% + €0.10 | 0.50% + €0.05 |
| **Payouts** | €3.00 | €2.00 | €1.20 | €0.60 |
| **Swaps (Spread)** | 1.50% | 1.00% | 0.60% | 0.30% |
| **Settlement** | T+3 | T+2 | T+1 | T+0 |

### Timeline de Settlement

| Tier | Timeline | Descrição |
|------|----------|-----------|
| TIER 0 | T+3 | Liquidação em 3 dias úteis |
| TIER 1 | T+2 | Liquidação em 2 dias úteis |
| TIER 2 | T+1 | Liquidação no dia seguinte |
| TIER 3 | T+0 | Liquidação imediata (mesmo dia) |

### Funcionalidades por Tier

| Funcionalidade | TIER 0 | TIER 1 | TIER 2 | TIER 3 |
|---------------|:------:|:------:|:------:|:------:|
| Recebimentos PIX | ✅ | ✅ | ✅ | ✅ |
| Recebimentos SEPA | ✅ | ✅ | ✅ | ✅ |
| Recebimentos USDT | — | ✅ | ✅ | ✅ |
| Payouts (manual) | — | ✅ | ✅ | ✅ |
| Payouts (automáticos) | — | — | ✅ | ✅ |
| Swaps básicos | — | ✅ | ✅ | ✅ |
| Swaps ilimitados | — | — | ✅ | ✅ |
| Payment Links | — | ✅ | ✅ | ✅ |
| API Keys | — | — | ✅ | ✅ |
| Checkouts personalizados | — | — | ✅ | ✅ |
| Sub-clientes | — | — | ✅ | ✅ |
| USD | — | — | ✅ | ✅ |
| Taxas negociáveis | — | — | — | ✅ |
| Settlement T+0 | — | — | — | ✅ |
| Suporte 24/7 prioritário | — | — | — | ✅ |

---

## 10. PWA — Progressive Web App

O XPayments.Digital é uma PWA completa, instalável em desktop e mobile.

### Manifest (`public/manifest.json`)

```json
{
  "name": "XPayments.Digital",
  "short_name": "XPayments",
  "display": "standalone",
  "background_color": "#0A0E1A",
  "theme_color": "#0A0E1A",
  "orientation": "any",
  "lang": "pt-BR",
  "categories": ["finance", "business", "payments"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service Worker (`public/sw.js`)

Cache versionado com timestamp de build para reliable cache busting:

```
CACHE_VERSION = 'xp-v3'
CACHE_NAME = 'xp-v3-<BUILD_TIMESTAMP>'
```

#### Estratégias de Cache

| Tipo de Recurso | Estratégia | Descrição |
|-----------------|-----------|-----------|
| **Chamadas API** (`/api/*`) | **Network-First** | Tenta rede, fallback para cache. Em offline: retorna `{ error: 'Sem conexão', offline: true }` com status 503 |
| **Páginas HTML** (same-origin) | **Stale-While-Revalidate** | Serve do cache imediatamente, atualiza em background |
| **Assets estáticos** (same-origin) | **Stale-While-Revalidate** | Carregamento instantâneo com atualização background |
| **Google Fonts CSS** | **Stale-While-Revalidate** | Cache dedicado (`xp-v3-fonts`) |
| **Google Fonts files** (woff2) | **Cache-First** | Cache permanente por 30 dias |

#### Ciclo de Vida

- **Install** — Pre-cache de assets críticos (`/`, `/manifest.json`, `/logo.png`, ícones, `/offline.html`). Usa `Promise.allSettled` para não falhar se um asset estiver indisponível. Ativação imediata via `skipWaiting()`
- **Activate** — Remove caches antigos (preserva offline e fonts). Reclama todos os clientes via `clients.claim()`
- **Fetch** — Roteamento por tipo de recurso com as estratégias descritas acima

#### Offline Fallback

Para requisições de navegação em offline, o SW serve `/offline.html`. Para chamadas API em offline, retorna JSON com `status: 503`.

### Instalação PWA

- **`PwaRegister`** — Componente que registra automaticamente o service worker no mount
- **`PwaInstallPrompt`** — Componente que detecta o evento `beforeinstallprompt` e exibe um banner de instalação nativo

### Suporte iOS

- `apple-mobile-web-app-capable: yes` no `<head>`
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `apple-touch-icon.png` para home screen
- `env(safe-area-inset-bottom)` respeitado na bottom nav e footer da sidebar

---

## 11. Design System — Dark Control Tower v3.0

### Filosofia

O design system "Dark Control Tower" cria uma experiência visual que remete a uma torre de controle financeira — fundo escuro profundo (`#0A0E1A`), acentos neon verde (#00FF7F) para indicadores positivos e ações primárias, e tons zinc para hierarquia visual.

### Sistema de Cores

#### Cores Neon Brand

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-neon` | `#00FF7F` | Cor principal da marca |
| `--color-neon-400` | `#00FF7F` | Acentos, links, indicadores ativos |
| `--color-neon-500` | `#00E672` | Botões primários, badges |
| `--color-neon-600` | `#00CC66` | Hover states |
| `--color-neon-700` | `#00994D` | Borders e divisores |
| `--color-neon-950` | `#003319` | Backgrounds sutis |

#### Cores Dark Theme

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#0A0E1A` | Background principal |
| `--card` | `oklch(0.205 0 0)` | Cards e superfícies elevadas |
| `--muted` | `oklch(0.269 0 0)` | Elementos desativados |
| `--muted-foreground` | `oklch(0.708 0 0)` | Texto secundário |
| `--border` | `oklch(1 0 0 / 10%)` | Bordas sutis |
| `--input` | `oklch(1 0 0 / 15%)` | Inputs e fields |

### Tipografia

| Fonte | Variable | Uso |
|-------|----------|-----|
| **Inter** | `--font-sans` | Texto principal, UI, headings |
| **JetBrains Mono** | `--font-mono` | Código, valores numéricos, endereços |

Configuradas via `next/font/google` com `display: swap` para performance.

### Animações Customizadas

| Nome | Classe | Descrição |
|------|--------|-----------|
| **Page Enter** | `animate-page-enter` | Transição de página SPA (fade + slide up) |
| **Card Enter** | `animate-card-enter` | Entrada de cards (fade + slide + scale) |
| **Shimmer** | `animate-shimmer` | Loading skeleton effect |
| **Glow Pulse** | `animate-glow-pulse` | Neon breathing para elementos ativos |
| **Stagger** | `animate-stagger` | Animação escalonada de filhos (até 8) |
| **Counter Flash** | `animate-counter-flash` | Flash verde em contadores atualizados |
| **Scale Fade In** | `animate-scale-fade-in` | Para modais, sheets e overlays |
| **Slide Up** | `animate-slide-up` | Para toasts e notificações |
| **Fade In** | `animate-fade-in` | Fade genérico rápido |
| **Float Up** | `animate-float-up` | Elementos flutuantes (landing) |
| **Pulse Glow** | `animate-pulse-glow` | Pulsação de opacidade (landing) |
| **Ticker Scroll** | `animate-ticker-scroll` | Marquee de preços (40s loop) |
| **Marquee Scroll** | `animate-marquee-scroll` | Marquee de logos (30s loop) |
| **Gradient X** | `animate-gradient-x` | Gradiente animado |
| **Neon Grid** | `xpayments-grid-bg` | Grid neon de fundo com sweep lines |
| **Neon Sweep** | `xpayments-sweep` | Linha luminosa cruzando o grid |

### Utilitários de Brand

| Classe | Efeito |
|--------|--------|
| `text-neon-glow` | Texto com text-shadow neon |
| `bg-neon-glow` | Box-shadow neon no fundo |
| `border-neon-glow` | Box-shadow neon na borda |
| `text-gradient-neon` | Texto com gradiente neon animado |
| `focus-neon` | Focus ring neon para acessibilidade |
| `noise-overlay` | Textura de ruído sutil para profundidade |

### Scrollbar Customizada

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(63, 63, 70, 0.5); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); } /* neon no hover */
```

### Componentes shadcn/ui

A biblioteca inclui **49 componentes** no estilo New York, incluindo:

Button, Card, Dialog, Sheet, Drawer, Input, Select, Textarea, Checkbox, Radio Group, Switch, Slider, Tabs, Table, Badge, Avatar, Tooltip, Popover, Dropdown Menu, Command (CmdK), Accordion, Collapsible, Calendar, Progress, Separator, ScrollArea, Skeleton, Alert, AlertDialog, Form, Label, Toast, Sonner/Toaster, Chart, Carousel, Pagination, Breadcrumb, Hover Card, Context Menu, Menubar, Navigation Menu, Resizable, Input OTP, Sidebar, Toggle, Toggle Group, Aspect Ratio, Page Error Boundary

---

## 12. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `NEXT_PUBLIC_API_URL` | **Sim** | URL base da API (sem `/api/v1`). Ex: `https://api.xpayments.digital` |
| `DATABASE_URL` | Não | String de conexão Prisma (SQLite local, desenvolvimento apenas) |
| `NEXTAUTH_SECRET` | Não | Reservado para fluxo futuro |
| `NEXTAUTH_URL` | Não | Reservado para fluxo futuro |

### `.env.example`

```bash
NEXT_PUBLIC_API_URL="https://api.xpayments.digital"
```

> ⚠️ **Atenção**: `NEXT_PUBLIC_API_URL` **não** inclui `/api/v1`. O client adiciona automaticamente `/api/v1` ao construir as URLs de request.

---

## 13. Scripts

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `next dev -p 3000` | Servidor de desenvolvimento (Turbopack) |
| `build` | `next build && cp -r ...` | Build de produção + cópia de assets para standalone |
| `start` | `NODE_ENV=production bun .next/standalone/server.js` | Iniciar servidor de produção standalone |
| `lint` | `eslint .` | Verificar qualidade do código com ESLint |
| `db:push` | `prisma db push` | Push do schema para o banco (sem migrações) |
| `db:generate` | `prisma generate` | Gerar Prisma Client |
| `db:migrate` | `prisma migrate dev` | Criar e aplicar migrações |
| `db:reset` | `prisma migrate reset` | Resetar banco de dados |

---

## 14. Deploy

### Standalone Output

O `next.config.ts` configura `output: "standalone"`, gerando uma build self-contained em `.next/standalone/` pronta para Docker/VPS:

```bash
# Build
bun run build

# Executar produção
NODE_ENV=production bun .next/standalone/server.js
```

### Vercel

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XPaymentsDigital/xpayments-digital.git&env=NEXT_PUBLIC_API_URL,https://api.xpayments.digital)

Basta clonar o repositório na Vercel e configurar a variável `NEXT_PUBLIC_API_URL`.

### Configuração do Next.js

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};
```

---

## 15. Roadmap v4.0

- [ ] **i18n Completo** — Internacionalização com `next-intl` (EN, PT, ES)
- [ ] **Notificações Push** — Web Push API para alertas de transações e payouts
- [ ] **Dashboard em Tempo Real** — WebSocket para atualizações live de saldos e transações
- [ ] **Multi-Tenant Avançado** — Gestão de sub-contas e permissões delegadas
- [ ] **Relatórios Exportáveis** — CSV/PDF de transações, taxas e settlement
- [ ] **2FA / Biometria** — Autenticação de dois fatores e biometria nativa
- [ ] **App Store** — Distribuição via Apple App Store e Google Play (Capacitor)
- [ ] **Audit Log** — Registo detalhado de todas as ações no sistema
- [ ] **Webhooks Avançados** — Configuração flexível de webhooks com retry
- [ ] **AI Contextual** — Assistente AI com contexto da conta e transações do utilizador

---

<div align="center">

**XPayments.Digital v3.0** — A ponte entre o sistema financeiro tradicional e a economia digital.

Desenvolvido com 💚 por [XPayments.Digital](https://xpayments.digital)

</div>