# XPayments.Digital v3.0 — Referência Técnica Completa

> **Super app fintech institucional — gestão de wallets multi-moeda, settlement automatizado, operações cross-border, PWA instalável e assistente AI integrado.**
>
> A ponte entre o sistema financeiro tradicional e a economia digital.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XPaymentsDigital/xpayments-digital.git&env=NEXT_PUBLIC_API_URL,https://api.xpayments.digital)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [API Client — Native Fetch com JWT](#5-api-client--native-fetch-com-jwt)
6. [Rotas da API — Mapeamento Completo](#6-rotas-da-api--mapeamento-completo)
7. [Sistema de Tipos TypeScript](#7-sistema-de-tipos-typescript)
8. [Stores — Estado Global (Zustand)](#8-stores--estado-global-zustand)
9. [RBAC & Permissões](#9-rbac--permissoes)
10. [Fluxo de Autenticação](#10-fluxo-de-autenticação)
11. [Navegação & View Routing](#11-navegação--view-routing)
12. [PWA — Progressive Web App](#12-pwa--progressive-web-app)
13. [AI Chat — Assistente Virtual](#13-ai-chat--assistente-virtual)
14. [Depósitos — Métodos & Fluxo](#14-depósitos--métodos--fluxo)
15. [Payouts — Fluxo de Saída](#15-payouts--fluxo-de-saída)
16. [Design System — Dark Control Tower v3.0](#16-design-system--dark-control-tower-v30)
17. [Design Responsivo — Mobile-First](#17-design-responsivo--mobile-first)
18. [SEO & Metadados](#18-seo--metadados)
19. [Deploy — Vercel](#19-deploy--vercel)
20. [Roadmap v4.0 (Próxima Versão)](#20-roadmap-v40-próxima-versão)
21. [Licença](#21-licença)
22. [Setup & Desenvolvimento](#22-setup--desenvolvimento)

---

## 1. Visão Geral

O **XPayments.Digital v3.0** é uma super app fintech institucional para pagamentos digitais com as seguintes capacidades:

- **Multi-Wallet**: Carteiras em EUR, BRL, USD e USDT com saldos segregados por estado (incoming, pending, available, blocked)
- **Depósitos**: PIX Instantâneo (BRL), SEPA Instant (EUR), Crypto Wallet (USDT/USDC via TRC-20)
- **Swap**: Conversão instantânea entre moedas com taxas reais da API pública
- **Payouts**: Saída em USDT (crypto instantâneo), EUR ou BRL (fiat processado manualmente via OTC desk, prazo D+1)
- **KYC Progressivo**: 4 tiers de verificação (Unverified → Basic → Verified → Corporate)
- **Gateway White-Label**: Links de pagamento, API Keys S2S e checkouts para merchants
- **RBAC**: 5 roles com matriz de permissões granular
- **Painel Admin**: Gestão de tickets, utilizadores, organizações e taxas
- **PWA Instalável**: Service worker com cache inteligente, manifest completo e install prompt nativo
- **AI Chat Integrado**: Assistente virtual com interface flutuante e proxy para LLM (OpenRouter)

### Zero Mock Data

Todas as páginas do dashboard estão conectadas à API real. Não existem dados simulados no fluxo principal. Quando a API não retorna dados, a UI exibe estados vazios adequados.

### PWA Instalável

A plataforma é uma Progressive Web App completa — pode ser instalada no dispositivo do utilizador (desktop ou mobile) e funciona com cache offline para assets estáticos.

### AI Assistente Integrado

Um chatbot flutuante com integração a modelos de linguagem (OpenRouter/GPT) está disponível em todas as páginas do dashboard, fornecendo suporte contextual sobre a plataforma.

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 4.x |
| Componentes | shadcn/ui (estilo New York) | latest |
| Estado Global | Zustand (com persist) | 5.x |
| HTTP Client | Fetch (native, wrapper próprio) | — |
| Animação | Framer Motion | 12.x |
| ORM (dev) | Prisma / SQLite | 6.x |
| Toasts | Sonner | 2.x |
| Gráficos | Recharts | 2.x |
| Tabelas | @tanstack/react-table | 8.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Ícones | Lucide React | 0.525+ |
| Internacionalização | next-intl | 4.x |
| Runtime | Bun | latest |
| Output | Standalone (Docker/VPS ready) | — |

---

## 3. Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, JSON-LD, SEO, PWA meta tags
│   ├── page.tsx                # Router principal (landing ↔ dashboard)
│   ├── globals.css             # Tailwind 4 + variáveis CSS neon + animações premium
│   ├── robots.ts               # robots.txt dinâmico
│   ├── sitemap.ts              # sitemap.xml dinâmico
│   └── api/
│       ├── health/route.ts     # Health check endpoint
│       ├── binance/route.ts    # Proxy para ticker público Binance
│       └── ai/
│           └── chat/
│               └── route.ts    # Proxy AI chat → Backend OpenRouter (NOVO v3.0)
├── components/
│   ├── layout/
│   │   ├── xp-landing.tsx      # Landing page + formulário login/register
│   │   └── xp-sidebar.tsx      # Sidebar com RBAC filtering
│   ├── dashboard/
│   │   ├── dashboard-page.tsx  # Painel principal (wallets + transações)
│   │   ├── admin-tickets-page.tsx
│   │   ├── admin-users-page.tsx
│   │   ├── admin-fees-page.tsx
│   │   ├── admin-organizations-page.tsx
│   │   ├── merchant-links-page.tsx
│   │   ├── merchant-api-keys-page.tsx
│   │   ├── merchant-checkouts-page.tsx
│   │   └── account-manager-dashboard.tsx
│   ├── wallet/
│   │   ├── wallets-page.tsx
│   │   ├── deposits-page.tsx   # Fluxo 3 etapas: método → detalhes → confirmação
│   │   ├── swaps-page.tsx
│   │   ├── payouts-page.tsx    # Formulário de payout (USDT → EUR/BRL/USDT)
│   │   └── transactions-page.tsx
│   ├── kyc/
│   │   └── kyc-page.tsx
│   ├── ai/
│   │   └── xp-ai-chat.tsx      # Chat widget flutuante (NOVO v3.0)
│   ├── pwa/
│   │   ├── pwa-register.tsx    # Auto-registo do service worker (NOVO v3.0)
│   │   └── pwa-install-prompt.tsx  # Banner de instalação PWA (NOVO v3.0)
│   ├── shared/
│   │   ├── crypto-cards.tsx    # Ticker tape + cards de cripto (Binance proxy)
│   │   └── animated-grid-bg.tsx  # Canvas particle system com constellation lines
│   └── ui/                     # Componentes shadcn/ui (~40 componentes)
├── lib/
│   ├── api/
│   │   └── client.ts           # Fetch wrapper + xpApi modules + XPaymentsApiError
│   ├── formatting.ts          # Helpers de exibição (símbolos, labels, cores)
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── stores/
│   ├── auth-store.ts           # Auth state + RBAC permissions matrix
│   ├── nav-store.ts            # Navegação SPA (currentPage + sidebar state)
│   ├── chat-store.ts           # Chat AI state — messages, isOpen, loading (NOVO v3.0)
│   └── baas-store.ts           # Estado auxiliar BaaS
├── hooks/
│   ├── use-mobile.ts           # Detecção de breakpoint mobile
│   └── use-toast.ts            # Hook legacy (Sonner é o padrão)
├── types/
│   ├── index.ts                # Re-exports
│   └── xpayments.ts            # Todos os tipos, enums e interfaces
└── providers/
    ├── theme-provider.tsx      # next-themes (dark por padrão)
    └── index.ts                # Barrel export

public/
├── manifest.json               # PWA manifest completo (NOVO v3.0)
├── sw.js                       # Service worker com cache versionado (NOVO v3.0)
├── icons/
│   ├── icon-192.png            # PWA icon 192×192 (NOVO v3.0)
│   └── icon-512.png            # PWA icon 512×512 + maskable (NOVO v3.0)
├── logo.png
├── logo.svg
├── favicon.ico
├── apple-touch-icon.png
└── og-image.png
```

---

## 4. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | **Sim** | URL base da API (sem `/api/v1`). Ex: `https://api.xpayments.digital`. O client acrescenta `/api/v1` automaticamente. |
| `DATABASE_URL` | Não (dev) | String de conexão Prisma (SQLite local, apenas para desenvolvimento) |
| `NEXTAUTH_SECRET` | Não | Reservado para fluxo futuro |
| `NEXTAUTH_URL` | Não | Reservado para fluxo futuro |

**Arquivo de referência**: `.env.example`

```
NEXT_PUBLIC_API_URL="https://api.xpayments.digital"
```

> ⚠️ **Atenção**: `NEXT_PUBLIC_API_URL` **não** inclui `/api/v1`. O client adiciona automaticamente `/api/v1` ao construir as URLs de request. Nunca adicione `/api/v1` na variável de ambiente nem nas chamadas individuais.

---

## 5. API Client — Native Fetch com JWT

O client HTTP é implementado em `src/lib/api/client.ts` utilizando **`fetch` nativo** (sem dependência de Axios), com um wrapper central `request<T>()` que encapsula toda a lógica de autenticação e tratamento de erros.

### Base URL & Prefixo

```
NEXT_PUBLIC_API_URL = "https://api.xpayments.digital"
                            ↓ (client adiciona automaticamente)
               https://api.xpayments.digital/api/v1/auth/login
```

O client lê `NEXT_PUBLIC_API_URL`, remove trailing slashes e concatena `/api/v1` + o path relativo da rota.

### Injeção JWT (Lazy Import Pattern)

O wrapper `request()` faz um **lazy import** de `useAuthStore` (para evitar dependência circular — o `auth-store` importa os storage helpers do próprio `client.ts`, que é carregado primeiro). O token é lido diretamente do Zustand store em cada request:

```typescript
// Lazy import para evitar dependência circular no module load
const { useAuthStore } = await import('@/stores/auth-store');
const token = useAuthStore.getState().token;
headers['Authorization'] = `Bearer ${token}`;
```

### Unwrap de Resposta

Todas as respostas do backend seguem o envelope padrão:

```typescript
interface XPaymentsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

O client faz o unwrap automaticamente — quando `json.success === true`, retorna `json.data` diretamente. Se o envelope não estiver presente (fallback), retorna o JSON integral.

### Tratamento de Erros — `XPaymentsApiError`

Classe customizada para erros de API, exportada de `client.ts`:

```typescript
class XPaymentsApiError extends Error {
  status: number;                         // HTTP status (ex: 404, 422)
  code?: string;                          // Código de erro do backend (ex: "INSUFFICIENT_BALANCE")
  details?: Record<string, unknown>;      // Detalhes adicionais do erro
}
```

Qualquer resposta com `!response.ok` lança `XPaymentsApiError` com a mensagem, status, código e detalhes extraídos do corpo JSON.

### Auto-Logout (401)

Quando uma resposta retorna status **401**, o client executa automaticamente:

1. `clearStoredToken()` + `clearStoredUser()` — limpa sessionStorage
2. `useAuthStore.getState().logout()` — limpa estado Zustand
3. `window.dispatchEvent(new CustomEvent('xp:unauthorized'))` — evento global

O componente raiz (`page.tsx`) escuta `xp:unauthorized` e redireciona para a landing page.

### Métodos Convenience

| Método | Descrição |
|--------|-----------|
| `get<T>(path, params?)` | GET com query params opcionais (filtrados automaticamente para remover `undefined`/`null`/`''`) |
| `post<T>(path, body?)` | POST com body JSON |
| `patch<T>(path, body?)` | PATCH com body JSON |

### Helpers de Armazenamento (sessionStorage)

| Função | Chave | Descrição |
|--------|-------|-----------|
| `getStoredToken()` | `xp_token` | Lê token do sessionStorage |
| `setStoredToken(token)` | `xp_token` | Grava token no sessionStorage |
| `clearStoredToken()` | `xp_token` | Remove token do sessionStorage |
| `getStoredUser<T>()` | `xp_user` | Lê e desserializa user do sessionStorage |
| `setStoredUser<T>(user)` | `xp_user` | Grava user serializado no sessionStorage |
| `clearStoredUser()` | `xp_user` | Remove user do sessionStorage |

Todos os helpers incluem guarda `typeof window === 'undefined'` para segurança em SSR.

---

## 6. Rotas da API — Mapeamento Completo

Todas as rotas são relativas a `/api/v1` (o client acrescenta automaticamente).

### Autenticação

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `POST` | `/auth/login` | `xpApi.auth.login` | Login merchant com email/password |
| `POST` | `/auth/register` | `xpApi.auth.register` | Registro de nova conta |
| `GET` | `/auth/me` | `xpApi.auth.me` | Perfil do utilizador autenticado |
| `POST` | `/admin/login` | `xpApi.admin.login` | Login admin/operator com email/password |

### Público (sem autenticação)

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/public/rates` | `xpApi.public.getRates` | Taxas de câmbio para o motor de swap |

### Merchant Dashboard

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/merchant/:merchantId/dashboard` | `xpApi.merchant.getDashboard` | Saldos Ledger Engine (AVAILABLE, PENDING, INCOMING, RESERVE) |
| `GET` | `/merchant/:merchantId/transactions` | `xpApi.merchant.getTransactions` | Transações recentes do merchant (limit, page) |

### Dashboard (Genérico)

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/dashboard/wallets` | `xpApi.dashboard.getWallets` | Carteiras com saldos agregados |
| `GET` | `/dashboard/transactions` | `xpApi.dashboard.getTransactions` | Últimas transações (com paginação) |

### Carteiras

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/wallets` | `xpApi.wallets.list` | Lista todas as carteiras do utilizador |
| `GET` | `/wallets/:id` | `xpApi.wallets.getById` | Detalhe de uma carteira específica |

### Transações

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/transactions` | `xpApi.transactions.list` | Lista transações com filtros (walletId, type, status, page, pageSize) |

### Depósitos

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `POST` | `/deposits` | `xpApi.deposits.create` | Cria solicitação de depósito |
| `POST` | `/deposits/:id/proof` | `xpApi.deposits.submitProof` | Envia comprovante (tx_hash ou receipt) |

### Swaps

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `POST` | `/swaps` | `xpApi.swaps.execute` | Executa conversão entre carteiras |

### Payouts

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `POST` | `/payouts` | `xpApi.payouts.create` | Solicita payout (saída de fundos) |

**Payload `PayoutRequest`:**

```typescript
{
  amountUSDT: number;                    // Montante em USDT
  requestedCurrency: 'USDT' | 'EUR' | 'BRL';  // Moeda de recebimento
  destinationInfo: string;               // Endereço crypto, IBAN ou chave PIX
  status?: PayoutStatus;                 // Opcional, preenchido pelo backend
}
```

### KYC

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/kyc/profile` | `xpApi.kyc.getProfile` | Perfil KYC atual com dados por tier |
| `POST` | `/kyc/upgrade` | `xpApi.kyc.upgrade` | Solicita upgrade de tier |

### Merchant Tools

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/merchant/:merchantId/dashboard` | `xpApi.merchant.getDashboard` | Saldos Ledger Engine do Merchant |
| `GET` | `/merchant/:merchantId/transactions` | `xpApi.merchant.getTransactions` | Transações recentes do Merchant |
| `GET` | `/merchant/api-keys` | `xpApi.merchant.getApiKeys` | Lista chaves API do merchant |
| `POST` | `/merchant/api-keys/generate` | `xpApi.merchant.generateApiKey` | Gera nova chave API |
| `GET` | `/merchant/links` | `xpApi.merchant.getPaymentLinks` | Lista links de pagamento |
| `POST` | `/merchant/links` | `xpApi.merchant.createPaymentLink` | Cria novo link de pagamento |

### AI Chat (NOVO v3.0)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/ai/chat` | Proxy Next.js para backend AI (OpenRouter) |

> **Nota**: Esta rota é uma API Route do Next.js (`src/app/api/ai/chat/route.ts`), **não** passa pelo client `xpApi`. O componente chat faz `fetch('/api/ai/chat', ...)` diretamente.

**Request body:**

```typescript
{
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}
```

**Header:** `Authorization: Bearer <JWT>` (encaminhado ao backend)

**Backend esperado:** `POST /api/v1/ai/chat` (ver secção [13. AI Chat](#13-ai-chat--assistente-virtual) para detalhes)

### Tickets

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/tickets` | `xpApi.tickets.list` | Lista tickets (filtros: status, type, page) |
| `PATCH` | `/tickets/:id` | `xpApi.tickets.update` | Atualiza status/resolução do ticket |

### Admin

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/admin/stats` | `xpApi.admin.getStats` | Estatísticas agregadas (merchants, volume, transações) |
| `GET` | `/admin/merchants` | `xpApi.admin.getMerchants` | Lista todos os merchants com detalhes |
| `GET` | `/organizations` | `xpApi.organizations.list` | Lista organizações |
| `GET` | `/users` | `xpApi.users.list` | Lista utilizadores (com paginação) |

---

## 7. Sistema de Tipos TypeScript

Todos os tipos estão centralizados em `src/types/xpayments.ts` (modelos de domínio) e `src/lib/api/client.ts` (tipos de resposta API), alinhados ao schema Prisma do backend.

### Enums

| Enum | Valores |
|------|---------|
| `UserRole` | `customer`, `merchant`, `super_merchant`, `admin`, `operator` |
| `OrgRole` | `ADMIN`, `OPERATOR`, `ACCOUNT_MANAGER` |
| `Currency` | `EUR`, `BRL`, `USDT`, `USD` |
| `TierLevel` | `TIER_0_UNVERIFIED`, `TIER_1_BASIC`, `TIER_2_VERIFIED`, `TIER_3_CORPORATE` |
| `TransactionType` | `PROXY_INCOMING`, `SETTLEMENT`, `PAYOUT`, `SWAP`, `TRANSFER`, `FEE` |
| `TransactionStatus` | `INCOMING`, `PENDING`, `COMPLETED`, `BLOCKED`, `FAILED` |
| `PayoutStatus` | `PENDING`, `PROCESSING`, `COMPLETED`, `REJECTED`, `CANCELLED` |
| `TicketType` | `MANUAL_WITHDRAWAL`, `TIER_UPGRADE`, `FEE_ADJUSTMENT`, `SUPPORT` |
| `TicketStatus` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| `AccountStatus` | `ACTIVE`, `SUSPENDED`, `BLOCKED` |
| `LedgerStatus` | `INCOMING`, `PENDING`, `RESERVE`, `AVAILABLE`, `CLEARED`, `AUDIT`, `BLOCKED` |

### Modelos Principais

| Tipo | Descrição |
|------|-----------|
| `Wallet` | Carteira com saldos segregados (balanceIncoming, balancePending, balanceAvailable, balanceBlocked) |
| `Transaction` | Transação com tipo, status, moeda, taxa e referências |
| `Merchant` | Organização merchant com tier e reserva percentual |
| `User` | Utilizador com role, tier, organização e carteiras |
| `OrgOperator` | Operador interno vinculado a uma organização |
| `OperationTicket` | Ticket de operação (aprovação manual, upgrade KYC, etc.) |
| `PaymentLink` | Link de pagamento white-label |
| `ApiKey` | Chave API S2S para integração merchant |
| `KycProfile` | Perfil KYC com dados progressivos por tier |
| `FeeSchedule` | Agendamento de taxas por tier e tipo de transação |
| `PaymentMethod` | Método de pagamento (network, label, currencies) |
| `GatewayRoute` | Rota de gateway de depósito (provider, min/max, estimatedTime) |

### API Response Types (client.ts)

| Tipo | Descrição |
|------|-----------|
| `MerchantLoginResponse` | Login response: `{ merchantId, name, tier, token }` |
| `AdminLoginResponse` | Admin login response: `{ adminId, name, role, token }` |
| `RegisterResponse` | Register response: `{ userId?, merchantId?, token?, message? }` |
| `AdminStatsResponse` | Stats agregados: `{ totalMerchants, activeMerchants, totalVolumeUSDT, totalTransactions, pendingTickets? }` |
| `AdminMerchant` | Merchant admin: `{ id, name, email?, tier, status, activeStores?, totalVolume?, createdAt? }` |
| `MerchantDashboardResponse` | Saldos Ledger: `{ balances?, totalStores?, activeStores?, pendingSettlements?, todayVolume? }` |
| `MerchantDashboardTransaction` | Transação merchant: `{ id, walletId?, store?, type?, status?, amount?, feeApplied?, currency?, fiatAmount?, fiatCurrency?, description?, createdAt? }` |
| `MerchantDashboardBalances` | Balances por estado: `{ available?, pending?, incoming?, reserve?, blocked?, totalUSDT? }` |

---

## 8. Stores — Estado Global (Zustand)

### Auth Store (`src/stores/auth-store.ts`)

Estado de autenticação persistido em **sessionStorage** via middleware `persist` do Zustand.

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `user` | `AuthUser \| null` | Dados do utilizador autenticado |
| `token` | `string \| null` | JWT token |
| `isAuthenticated` | `boolean` | Flag de autenticação |
| `isLoading` | `boolean` | Loading state para operações de auth |

| Ação | Descrição |
|------|-----------|
| `setAuth(token, user)` | Define token + user, persiste no sessionStorage |
| `updateUser(updates)` | Atualiza campos parciais do user |
| `logout()` | Limpa token, user e sessionStorage |
| `getUserRole()` | Retorna a role atual (default: `customer`) |
| `isOperator()` | Verifica se a role é `operator` |
| `isMerchant()` | Verifica se a role é `merchant`, `super_merchant` ou `customer` |

### Nav Store (`src/stores/nav-store.ts`)

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `currentPage` | `NavPage` | Página atual do SPA |
| `sidebarOpen` | `boolean` | Estado de expansão da sidebar |

| Ação | Descrição |
|------|-----------|
| `setPage(page)` | Navega para a página indicada |
| `toggleSidebar()` | Alterna expansão da sidebar |
| `setSidebarOpen(open)` | Define estado da sidebar |

**Páginas disponíveis**: `admin-dashboard`, `dashboard`, `wallets`, `deposits`, `swaps`, `payouts`, `transactions`, `kyc`, `admin-tickets`, `admin-users`, `admin-fees`, `admin-organizations`, `merchant-links`, `merchant-api-keys`, `merchant-checkouts`

### Chat Store (`src/stores/chat-store.ts`) — NOVO v3.0

Estado do assistente AI, **não persistido** (sessão apenas).

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `isOpen` | `boolean` | Painel do chat aberto/fechado |
| `messages` | `ChatMessage[]` | Histórico de mensagens da sessão |
| `isLoading` | `boolean` | Aguardando resposta do LLM |

| Ação | Descrição |
|------|-----------|
| `toggleChat()` | Alterna painel do chat |
| `openChat()` | Abre o painel |
| `closeChat()` | Fecha o painel |
| `addMessage(msg)` | Adiciona mensagem (gera `id` e `timestamp` automaticamente) |
| `setLoading(loading)` | Define estado de loading |
| `clearMessages()` | Limpa todo o histórico |

**Tipo `ChatMessage`:**

```typescript
interface ChatMessage {
  id: string;                          // Gerado: `msg-${Date.now()}-${random}`
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;                   // `Date.now()`
}
```

---

## 9. RBAC & Permissões

### 5 Roles Definidas

| Role | Label | Descrição |
|------|-------|-----------|
| `customer` | Customer | Utilizador final sem organização |
| `merchant` | Merchant | Lojista vinculado a uma organização |
| `super_merchant` | Super Merchant | Merchant com acesso a sub-clientes |
| `admin` | Admin | Acesso total à plataforma |
| `operator` | Operator | Operador interno (equipe XPayments) |

### Matriz de Permissões

| Permissão | Customer | Merchant | Super Merchant | Admin | Operator |
|-----------|:--------:|:--------:|:--------------:|:-----:|:--------:|
| `canViewDashboard` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `canViewWallets` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `canDeposit` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `canSwap` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `canWithdraw` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `canViewTransactions` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `canGeneratePaymentLinks` | ✗ | ✓ | ✓ | ✓ | ✗ |
| `canManageApiKeys` | ✗ | ✓ | ✓ | ✓ | ✗ |
| `canConfigureCheckouts` | ✗ | ✓ | ✓ | ✓ | ✗ |
| `canViewSubClients` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `canManageTickets` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `canApproveKyc` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `canConfigureFees` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `canManageOrganizations` | ✗ | ✗ | ✗ | ✓ | ✓ |
| `canManageUsers` | ✗ | ✗ | ✗ | ✓ | ✓ |

A sidebar filtra os itens de navegação com base na role + permissão individual de cada item. A role é lida do payload JWT retornado pelo backend.

---

## 10. Fluxo de Autenticação

O formulário de autenticação está integrado na landing page (`xp-landing.tsx`) com um toggle **Login / Registro** e um switch **Admin** para alternar entre fluxos de merchant e admin.

### Merchant Login

```
POST /api/v1/auth/login   { email, password }
        ↓
Response: { merchantId, name, tier, token }
        ↓
mapRole() → "merchant"
        ↓
setAuth(token, user) → Zustand + sessionStorage → Dashboard
```

### Admin / Operator Login

Ativado pelo **toggle switch** "Acessar como Admin" na landing page:

```
POST /api/v1/admin/login   { email, password }
        ↓
Response: { adminId, name, role, token }
        ↓
mapRole(role) → mapeia role do backend (ver tabela abaixo)
        ↓
setAuth(token, user) → Zustand + sessionStorage → Dashboard
```

### Registro

```
POST /api/v1/auth/register   { email, password, storeName? }
        ↓
Response: { userId?, merchantId?, token?, message }
        ↓
Se token presente → setAuth() + Dashboard
Se não → mensagem de confirmação (verificar email, etc.)
```

### Mapeamento de Roles (Backend → Frontend)

A função `mapRole()` na landing page converte as roles do backend para o enum `UserRole` do frontend:

| Role do Backend | Role do Frontend | Descrição |
|----------------|-----------------|-----------|
| `SUPER_ADMIN` / `ADMIN` | `admin` | Acesso total (Admin) |
| `OPERATOR` | `operator` | Operações internas (sem depósitos/swaps/payouts) |
| `SUPER_MERCHANT` | `super_merchant` | Merchant com sub-clientes |
| `CUSTOMER` | `customer` | Utilizador sem organização |
| *(outros)* | `merchant` | Fallback padrão |

### Fluxo Pós-Login (comum)

```
┌──────────────────────────────────────┐
│ 1. setAuth(token, user)              │  ← Zustand store (useAuthStore)
│ 2. sessionStorage.setItem('xp_token') │  ← Armazenamento
│ 3. sessionStorage.setItem('xp_user')  │  ← Armazenamento
│ 4. dispatch('xp:authenticated')      │  ← Evento customizado
│ 5. Router → Dashboard                 │  ← Navegação
└──────────────────────────────────────┘
```

### Eventos Customizados

| Evento | Quando é disparado | Efeito |
|--------|-------------------|--------|
| `xp:authenticated` | Após login bem-sucedido | Navega para Dashboard |
| `xp:logout` | Ao encerrar sessão | Volta à Landing Page |
| `xp:unauthorized` | Quando o client recebe 401 | Logout automático + limpa sessão |

### Auto-Logout

O wrapper `request()` em `client.ts` captura qualquer resposta com status `401`, executa `clearStoredToken()` + `clearStoredUser()` + `useAuthStore.getState().logout()` e dispara `xp:unauthorized`. O componente raiz (`page.tsx`) escuta este evento e redireciona para a landing page.

### Dev Mode

A landing page inclui botões de **Dev Mode** (visíveis apenas em ambiente local) que permitem login instantâneo sem API, útil para desenvolvimento e teste de permissões RBAC.

---

## 11. Navegação & View Routing

A aplicação utiliza um **SPA-like view routing** dentro do App Router do Next.js:

- `src/app/page.tsx` é o componente raiz que decide o que renderizar com base no estado `isAuthenticated`
- **Não autenticado** → renderiza `<XPaymentsLanding />`
- **Autenticado** → renderiza sidebar + página atual baseada em `useNavStore().currentPage`

O mapeamento de páginas é definido no objeto `PAGES` em `page.tsx`, associando cada `NavPage` ao seu componente React correspondente.

### Seções da Sidebar

| Seção | Páginas | Roles com acesso |
|-------|---------|-----------------|
| (root) | Painel | Todos |
| WALLET | Carteiras, Depositar, Swap, Payouts, Transações | Customer, Merchant, Super Merchant |
| VERIFICAÇÃO | Verificação KYC | Customer, Merchant, Super Merchant |
| MERCHANT | Links de Pagamento, API Keys, Checkouts | Merchant, Super Merchant |
| ADMIN | Aprovações, Liquidez, Utilizadores, Organizações | Operator |

### Transição de Páginas

Cada troca de página aplica a classe `animate-page-enter` (slide-up + fade-in, 0.3s) ao container do conteúdo.

---

## 12. PWA — Progressive Web App (NOVO v3.0)

A XPayments.Digital v3.0 é uma PWA completa, instalável em desktop e mobile.

### Service Worker

**Localização:** `public/sw.js`

Estratégias de cache por tipo de request:

| Tipo | Estratégia | Descrição |
|------|-----------|-----------|
| Assets estáticos (HTML, CSS, JS, imagens) | **Cache-first** + atualização em background | Serve do cache imediatamente; se rede disponível, atualiza o cache para requests futuros |
| Chamadas API (`/api/`) | **Network-first** + fallback ao cache | Tenta rede primeiro; em caso de falha, serve do cache se disponível |

Detalhes de implementação:

- **Cache version:** `xp-v3` — ao atualizar, o nome muda e caches antigos são removidos automaticamente
- **Pre-cache no install:** `/`, `/manifest.json`, `/logo.png`, `/logo.svg`
- **Auto-cleanup:** No evento `activate`, todos os caches com nome diferente de `xp-v3` são deletados
- **Skip waiting:** `self.skipWaiting()` garante ativação imediata

```javascript
const CACHE_NAME = 'xp-v3';
const STATIC_ASSETS = ['/', '/manifest.json', '/logo.png', '/logo.svg'];
```

### Manifest

**Localização:** `public/manifest.json`

| Campo | Valor |
|-------|-------|
| `name` | XPayments.Digital |
| `short_name` | XPayments |
| `start_url` | `/` |
| `display` | `standalone` |
| `background_color` | `#09090b` |
| `theme_color` | `#10b981` |
| `orientation` | `any` |
| `lang` | `pt-BR` |
| `categories` | `finance`, `business`, `payments` |

**Ícones:**

| Tamanho | Ficheiro | Propriedade |
|---------|----------|-------------|
| 192×192 | `/icons/icon-192.png` | Padrão |
| 512×512 | `/icons/icon-512.png` | Padrão |
| 512×512 | `/icons/icon-512.png` | `maskable` |

**Atalho:** Dashboard → `/` ("Painel Financeiro")

### Install Prompt

Dois componentes gerenciam a experiência de instalação:

| Componente | Localização | Descrição |
|-----------|-------------|-----------|
| `PwaRegister` | `src/components/pwa/pwa-register.tsx` | Regista automaticamente `/sw.js` no `navigator.serviceWorker` ao montar. Renderiza `null` (não tem UI). |
| `PwaInstallPrompt` | `src/components/pwa/pwa-install-prompt.tsx` | Banner animado (Framer Motion) no bottom-left. Aparece quando o browser dispara `beforeinstallprompt`. Botão "Instalar" + botão "X" para dispensar. |

**Comportamento de dismiss:** O utilizador pode fechar o prompt com o botão X, que grava `pwa-install-dismissed` no `sessionStorage`. O prompt não reaparece na mesma sessão.

**Animação:** Entrada com `slide-in-from-bottom-4` + `fade-in-0` (spring, damping: 25, stiffness: 300).

### Meta Tags PWA

No `<head>` do `layout.tsx`:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

**Viewport `themeColor`:** `#10b981` (emerald-500)

---

## 13. AI Chat — Assistente Virtual (NOVO v3.0)

### Arquitetura

```
User → xp-ai-chat.tsx → POST /api/ai/chat (Next.js route) → Backend /api/v1/ai/chat → OpenRouter
```

O frontend **não** chama o LLM diretamente. Todas as mensagens passam por uma API Route do Next.js que atua como proxy seguro, encaminhando o request ao backend XPayments com o JWT do utilizador.

### Chat Widget

**Componente:** `src/components/ai/xp-ai-chat.tsx`

| Elemento | Especificação |
|----------|--------------|
| Botão flutuante | Fixo `bottom-6 right-6`, 56×56px, `bg-neon-500` com `shadow-[0_0_20px_rgba(16,185,129,0.3)]`, pulse animado quando chat está fechado |
| Painel do chat | Fixo `bottom-24 right-6`, `max-w-[380px]` × `520px`, responsivo (`w-[calc(100vw-2rem)]` em mobile) |
| Header | Ícone `Bot` com ponto verde pulsante, título "XPayments AI", subtítulo "Assistente Virtual", botão fechar |
| Input | Campo de texto com bordas neon no focus, botão enviar com ícone `SendHorizontal` |
| Store | `src/stores/chat-store.ts` (Zustand, não persistido) |

**Funcionalidades:**

| Feature | Descrição |
|---------|-----------|
| Suggestion chips | 3 chips iniciais: "Ver saldos", "Transações recentes", "Ajuda com KYC" |
| Typing indicator | 3 pontos pulsantes com `animate-pulse` e delays escalonados (0ms, 150ms, 300ms) |
| Auto-scroll | `scrollIntoView({ behavior: 'smooth' })` a cada nova mensagem ou mudança de loading |
| Auto-focus | Input recebe foco 100ms após abertura do painel (aguarda animação) |
| Error handling | Em caso de erro, adiciona mensagem `role: 'system'` com texto de erro |
| Mensagem do assistant | Extrai de `data.data.content \|\| data.content \|\| data.message` |

**Estilo das mensagens:**

| Role | Fundo | Borda | Alinhamento |
|------|-------|-------|-------------|
| `user` | `bg-neon-500/15` | `rounded-br-md` (canto reto inferior-direito) | Direita |
| `assistant` | `bg-white/[0.05]` | `rounded-bl-md` (canto reto inferior-esquerdo) | Esquerda |
| `system` | Sem fundo | — | Centrado, texto `zinc-600` |

### Backend Esperado

O backend deve implementar o endpoint:

```
POST /api/v1/ai/chat
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Request:**

```typescript
{
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}
```

**Response:**

```typescript
{
  success: true,
  data: {
    message: string  // ou { content: string }
  }
}
```

O backend deve:
1. Validar o JWT e identificar o merchant/utilizador
2. Adicionar um **system prompt** com personalidade XPayments e contexto da plataforma
3. Enviar o array de mensagens ao provedor LLM (OpenRouter, OpenAI, etc.)
4. Retornar a resposta no envelope padrão `{ success, data }`

### Configuração Sugerida (Backend)

```env
OPENROUTER_API_KEY=sk-or-...
AI_MODEL=openai/gpt-4o
AI_SYSTEM_PROMPT="És o assistente virtual da XPayments.Digital. Ajudas merchants com saldos, transações, KYC, depósitos, swaps e payouts. Responde sempre em português."
```

---

## 14. Depósitos — Métodos & Fluxo

### Métodos Disponíveis

| Método | Moeda | Descrição | Comprovante |
|--------|-------|-----------|-------------|
| **PIX Instantâneo** | BRL | Transferência PIX em tempo real | `receipt` (referência/ID) |
| **SEPA Instant** | EUR | Transferência bancária europeia | `receipt` (referência/ID) |
| **Crypto Wallet** | USDT | USDT/USDC via rede TRC-20 | `tx_hash` (hash da transação) |

### Fluxo (3 Etapas)

```
Etapa 1: Seleção do Método
    ↓
Etapa 2: Valor + Instruções de Pagamento + Envio de Comprovante
    ↓
Etapa 3: Confirmação (status: "Em verificação")
```

O fluxo chama duas APIs em sequência:
1. `POST /deposits` — cria o registro do depósito
2. `POST /deposits/:id/proof` — envia o comprovante para verificação

---

## 15. Payouts — Fluxo de Saída

### Fluxo

```
Saldo USDT (AVAILABLE) → Seleciona moeda de recebimento → Informa destino → Submete
```

### Opções de Recebimento

| Moeda | Tipo | Destino | Processamento |
|-------|------|---------|---------------|
| **USDT** | Crypto | Endereço de carteira (TRC-20, ERC-20, etc.) | Automático (minutos) |
| **EUR** | Fiat | IBAN do destinatário | Manual via OTC desk (D+1) |
| **BRL** | Fiat | Chave PIX (CPF, email, telefone ou aleatória) | Manual via OTC desk (D+1) |

### Payload

```typescript
interface PayoutRequest {
  amountUSDT: number;
  requestedCurrency: 'USDT' | 'EUR' | 'BRL';
  destinationInfo: string;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
}
```

---

## 16. Design System — Dark Control Tower v3.0

### Paleta Principal

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-neon` / `neon-400` | `#00FF7F` | Cor de destaque primária (neon green) |
| `neon-500` | `#00E672` | Gradientes, botões principais |
| `neon-600` | `#00CC66` | Gradientes (início), hovers |
| `neon-950` | `#003319` | Backgrounds de alto contraste |
| PWA Theme Color | `#10b981` | emerald-500, usado no manifest e meta tag |
| Background | `#0A0E1A` | Background principal (dark) |
| Card | `zinc-900/50` | Cards com transparência |
| Border | `zinc-800` | Bordas de cards e divisores |
| Text primary | `zinc-100` | Texto principal |
| Text secondary | `zinc-400` | Texto secundário |

### Tipografia

| Fonte | Variável CSS | Uso |
|-------|-------------|-----|
| Inter | `--font-sans` | Texto geral (UI) |
| JetBrains Mono | `--font-mono` | Código, endereços, hashes |

Ambas configuradas com `font-display: swap` para performance de carregamento.

### Animações Premium (NOVO v3.0)

Todas definidas em `src/app/globals.css`:

| Animação | Classe CSS | Descrição | Duração |
|----------|-----------|-----------|---------|
| `particle-drift` | — | Partículas CSS flutuantes (starfield) com `--dx`, `--dy`, `--s` customizáveis | 6s (ease-in-out, infinite) |
| `shimmer` | `.animate-shimmer` | Skeleton loading premium — gradiente horizontal deslizante | 2s (ease-in-out, infinite) |
| `glow-pulse` | `.animate-glow-pulse` | Neon breathing — box-shadow pulsante em emerald | 4s (ease-in-out, infinite) |
| `card-enter` | `.animate-card-enter` | Card entrance — slide-up + fade-in com scale | 0.5s (cubic-bezier 0.16, 1, 0.3, 1) |
| `value-update` | `.animate-value-update` | Balance change flash — opacidade pulsa brevemente | 0.3s (ease) |
| `page-enter` | `.animate-page-enter` | SPA page transition — slide-up + fade-in | 0.3s (cubic-bezier 0.16, 1, 0.3, 1) |
| `ticker-scroll` | `.animate-ticker-scroll` | Ticker tape horizontal de cripto | 40s (linear, infinite) |
| `marquee-scroll` | `.animate-marquee-scroll` | Marquee genérico | 30s (linear, infinite) |
| `neon-flow` | `.xpayments-grid-bg` | Grid background com linhas neon pulsantes | 8s (ease-in-out, infinite) |
| `sweep-horizontal` | `.xpayments-sweep::before` | Feixe de luz horizontal no grid | 12s (linear, infinite) |
| `sweep-vertical` | `.xpayments-sweep::after` | Feixe de luz vertical no grid | 16s (linear, infinite) |

Adicionalmente, existem animações para a landing page: `float-up`, `pulse-glow`, `slide-in-left`, `slide-in-right`, `gradient-x`.

### Background Particle System (NOVO v3.0)

**Componente:** `src/components/shared/animated-grid-bg.tsx`

Sistema de partículas canvas-based que cria um efeito de constelação interativa.

| Propriedade | Valor |
|-------------|-------|
| Partículas | 50 |
| Distância de conexão | 140px |
| Raio de atração do mouse | 180px |
| Força de atração | 0.008 |
| Cor (RGB) | `16, 185, 129` (#10b981, emerald) |
| FPS target | 30 (throttle via `requestAnimationFrame`) |
| DPR awareness | `Math.min(devicePixelRatio, 2)` |
| Comportamento nas bordas | Wrap-around (partículas reaparecem no lado oposto) |

**Elementos visuais:**

1. **Partículas:** Pontos com radius 1–2.5px e opacidade 0.1–0.4
2. **Linhas de constelação:** Conectadas entre partículas < 140px com alpha proporcional à distância
3. **Cursor glow:** Gradiente radial (300px raio) que segue o mouse com smoothing (`0.04` interpolation lag)
4. **Grid CSS overlay:** Camada base com grid lines neon (`.xpayments-grid-bg`)

**Performance:** O loop de renderização é throttled a 30fps. O canvas respeita o device pixel ratio (limitado a 2x) para evitar overhead em displays de alta densidade.

### Componentes

- **shadcn/ui** (estilo New York) como base (~40 componentes)
- **Sonner** para toasts (position: `top-right`, `richColors`)
- **PwaRegister** — auto-registo do service worker
- **PwaInstallPrompt** — banner de instalação PWA com Framer Motion
- **XpAiChat** — chat widget flutuante com AI assistant
- Cards com `bg-zinc-900/50 border-zinc-800` e backdrop-blur
- Botões principais com gradiente `from-neon-600 to-neon-500`
- Badges com variantes outline em `border-zinc-700 bg-zinc-900`

### Padrões Visuais — Dashboards

#### Merchant Dashboard (`dashboard-page.tsx`)

| Elemento | Estilo |
|----------|--------|
| Header | Ícone `TrendingUp` + "Dashboard Financeiro" + nome da org |
| Ledger Cards | 4 colunas (1/2/4 responsive) com `border-white/[0.06] bg-white/[0.02]` |
| Card AVAILABLE | Borda verde, `text-emerald-400`, ícone `Wallet` |
| Card PENDING | Borda âmbar, `text-amber-400`, ícone `Clock` |
| Card INCOMING | Borda azul, `text-sky-400`, ícone `ArrowDownLeft` |
| Card RESERVE | Borda roxa, `text-purple-400`, ícone `ShieldAlert` |
| Tabela Transações | shadcn `Table`, status badges coloridos, mobile cards |
| Loading | `Skeleton` animado em todas as posições |
| Erro | Banner vermelho com retry automático |

#### Admin Dashboard (`admin-dashboard-page.tsx`)

| Elemento | Estilo |
|----------|--------|
| Header | Ícone `Shield` + "Super Admin Overview" + badge "Master System" neon |
| Stat Cards | 3 colunas: Merchants Ativos, Volume USDT, Routing Engine Status |
| Routing Status | Ponto verde pulsante (`animate-ping`) |
| Merchants Table | Desktop table + mobile cards, tier badges coloridos |

---

## 17. Design Responsivo — Mobile-First

### Abordagem

A aplicação adota uma estratégia **mobile-first** com breakpoints responsivos em todos os grids e layouts.

### Sidebar

| Breakpoint | Comportamento |
|------------|---------------|
| `< md` (mobile) | Sidebar como **overlay** absoluto, controlada por botão hamburger no header. Backdrop com `bg-black/60 backdrop-blur-sm`. |
| `≥ md` (desktop) | Sidebar **static** no fluxo flex, com toggle collapse/expand (64px ↔ 256px). |

### Grids

Todos os grids utilizam breakpoints responsivos:
- `grid-cols-2 lg:grid-cols-3` (cards de cripto)
- `grid grid-cols-1 sm:grid-cols-4` (moedas suportadas na landing)
- Padding de conteúdo: `p-4 sm:p-6 lg:p-8`

### Header

- Mobile: botão hamburger sempre visível
- Desktop: botão hamburger apenas quando sidebar está colapsada
- Badge de versão oculto em telas pequenas (`hidden sm:inline-flex`)

### Chat AI (Mobile)

O painel do chat é 100% responsivo:
- **Mobile:** `w-[calc(100vw-2rem)]` — quase full-width com 1rem de margem
- **Desktop:** `max-w-[380px]` — largura fixa

---

## 18. SEO & Metadados

### Arquivos Dinâmicos

| Arquivo | Descrição |
|---------|-----------|
| `src/app/robots.ts` | Gera `robots.txt`: permite `/`, bloqueia `/api/` e `/admin/` |
| `src/app/sitemap.ts` | Gera `sitemap.xml` com URL principal, prioridade 1, frequência semanal |

### JSON-LD Structured Data

Tipo `FinancialService` no Schema.org, injetado no `<head>` via `layout.tsx`:

```json
{
  "@type": "FinancialService",
  "name": "XPayments.Digital",
  "areaServed": ["Brazil", "Portugal", "European Union"],
  "serviceType": ["Payment Gateway", "Digital Wallet", "Currency Exchange", "Cross-border Payments"],
  "knowsAbout": ["Blockchain", "Cryptocurrency", "Fiat Payments", "SEPA", "PIX"]
}
```

### Open Graph & Twitter Cards

- Tipo: `website`
- Locale: `pt_BR`
- Imagem OG: `/og-image.png` (1200×630)
- Twitter: `summary_large_image`

### Performance

| Otimização | Implementação |
|------------|---------------|
| `font-display: swap` | Fontes Inter e JetBrains Mono |
| `dns-prefetch` | `https://api.xpayments.digital` no `<head>` |
| `preconnect` | Google Fonts e gstatic |
| `output: standalone` | Build otimizado para Docker/VPS |

---

## 19. Deploy — Vercel (NOVO v3.0)

### Configuração Automática

O repositório está configurado para deploy automático no Vercel:

1. Fazer fork do repositório
2. Importar no [Vercel](https://vercel.com/new) (`vercel.com/new`)
3. Configurar variável de ambiente:
   - `NEXT_PUBLIC_API_URL=https://api.xpayments.digital`
4. Deploy automático em cada push para `main`

### Variáveis de Ambiente no Vercel

| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.xpayments.digital` | Sim |

### Build Configuration

| Configuração | Valor |
|-------------|-------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `bun install` |

O projeto utiliza `output: "standalone"` no `next.config.ts`, permitindo também deploy em qualquer ambiente com suporte a Node.js/Bun.

### Docker / VPS

```bash
# Build
bun run build

# Start (produção)
bun run start
# Equivalente a: NODE_ENV=production bun .next/standalone/server.js
```

O script de build copia automaticamente os assets estáticos e a pasta `public` para dentro do diretório standalone.

### Caddy (Exemplo)

O projeto inclui um `Caddyfile` de referência para deploy com reverse proxy.

---

## 20. Roadmap v4.0 (Próxima Versão)

- [ ] **Webhook notifications** — Eventos de pagamento em tempo real via webhooks
- [ ] **Multi-language (i18n)** — Suporte multi-idioma com `next-intl` (já instalado como dependência)
- [ ] **Dashboard analytics** — Gráficos interativos com Recharts (já instalado como dependência)
- [ ] **Checkout embeddable** — Widget iframe para merchants integrarem checkout diretamente
- [ ] **Sub-clientes** — Hierarquia Super Merchant → Sub-merchants
- [ ] **API Rate limiting** — Limitação de requests no frontend
- [ ] **Biometria (WebAuthn)** — Autenticação 2FA por biometria
- [ ] **Dark/Light theme toggle** — Alternância de tema claro/escuro
- [ ] **Export CSV/Excel** — Exportação de transações em formato tabular
- [ ] **Notificações push** — Service worker + backend para notificações em tempo real

---

## 21. Licença

Projeto proprietário — **UNLICENSED**. Todos os direitos reservados a XPayments.Digital.

---

## 22. Setup & Desenvolvimento

```bash
# 1. Clonar o repositório
git clone https://github.com/XPaymentsDigital/xpayments-digital.git
cd xpayments-digital

# 2. Instalar dependências
bun install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com NEXT_PUBLIC_API_URL

# 4. (Opcional) Setup do banco de dados local (Prisma/SQLite)
bun run db:push

# 5. Iniciar em modo de desenvolvimento
bun run dev
# Acesse http://localhost:3000
```

### Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `next dev -p 3000` | Servidor de desenvolvimento com Turbopack |
| `build` | `next build` + copy assets | Build de produção standalone |
| `start` | `bun .next/standalone/server.js` | Inicia servidor de produção |
| `lint` | `eslint .` | Linting com ESLint |
| `db:push` | `prisma db push` | Sincroniza schema Prisma com o banco |
| `db:generate` | `prisma generate` | Gera client Prisma |
| `db:migrate` | `prisma migrate dev` | Cria e aplica migrações |
| `db:reset` | `prisma migrate reset` | Reseta o banco de dados |