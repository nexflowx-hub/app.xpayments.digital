# XPayments.Digital — Referência Técnica

> **Plataforma institucional Web3 para gestão de wallets multi-moeda, settlement automatizado e operações cross-border.**
>
> A ponte entre o sistema financeiro tradicional e a economia digital.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XPaymentsDigital/xpayments-digital.git&env=NEXT_PUBLIC_API_URL,https://api.xpayments.digital/api/v1)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [API Client — Axios com JWT Interceptors](#5-api-client--axios-com-jwt-interceptors)
6. [Rotas da API — Mapeamento Completo](#6-rotas-da-api--mapeamento-completo)
7. [Sistema de Tipos TypeScript](#7-sistema-de-tipos-typescript)
8. [Stores — Estado Global (Zustand)](#8-stores--estado-global-zustand)
9. [RBAC & Permissões](#9-rbac--permissoes)
10. [Fluxo de Autenticação](#10-fluxo-de-autenticação)
11. [Navegação & View Routing](#11-navegação--view-routing)
12. [Depósitos — Métodos & Fluxo](#12-depósitos--métodos--fluxo)
13. [Payouts — Fluxo de Saída](#13-payouts--fluxo-de-saída)
14. [Design System — Dark Control Tower](#14-design-system--dark-control-tower)
15. [Design Responsivo — Mobile-First](#15-design-responsivo--mobile-first)
16. [SEO & Metadados](#16-seo--metadados)
17. [Landing Page](#17-landing-page)
18. [Deploy](#18-deploy)
19. [Setup & Desenvolvimento](#19-setup--desenvolvimento)
20. [Licença](#20-licença)

---

## 1. Visão Geral

O **XPayments.Digital** é uma plataforma institucional de pagamentos com as seguintes capacidades:

- **Multi-Wallet**: Carteiras em EUR, BRL, USD e USDT com saldos segregados por estado (incoming, pending, available, blocked)
- **Depósitos**: PIX Instantâneo (BRL), SEPA Instant (EUR), Crypto Wallet (USDT/USDC via TRC-20)
- **Swap**: Conversão instantânea entre moedas com taxas reais da API pública
- **Payouts**: Saída em USDT (crypto instantâneo), EUR ou BRL (fiat processado manualmente via OTC desk, prazo D+1)
- **KYC Progressivo**: 4 tiers de verificação (Unverified → Basic → Verified → Corporate)
- **Gateway White-Label**: Links de pagamento, API Keys S2S e checkouts para merchants
- **RBAC**: 5 roles com matriz de permissões granular
- **Painel Admin**: Gestão de tickets, utilizadores, organizações e taxas

Todas as páginas estão conectadas à API real. Não existem dados simulados no fluxo principal.

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 4.x |
| Componentes | shadcn/ui (estilo New York) | latest |
| Estado Global | Zustand (com persist) | 5.x |
| HTTP Client | Axios (com interceptors) | 1.x |
| ORM (dev) | Prisma / SQLite | 6.x |
| Toasts | Sonner | 2.x |
| Gráficos | Recharts | 2.x |
| Tabelas | @tanstack/react-table | 8.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Animação | Framer Motion | 12.x |
| Ícones | Lucide React | 0.525+ |
| Runtime | Bun | latest |
| Output | Standalone (Docker/VPS ready) | — |

---

## 3. Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, JSON-LD, SEO metadata
│   ├── page.tsx                # Router principal (landing ↔ dashboard)
│   ├── globals.css             # Tailwind 4 + variáveis CSS neon
│   ├── robots.ts               # robots.txt dinâmico
│   ├── sitemap.ts              # sitemap.xml dinâmico
│   └── api/
│       ├── health/route.ts     # Health check endpoint
│       └── binance/route.ts    # Proxy para ticker público Binance
├── components/
│   ├── layout/
│   │   ├── xp-landing.tsx      # Landing page + formulário login/register
│   │   ├── xp-login.tsx        # Tela de login dedicada
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
│   ├── shared/
│   │   ├── crypto-cards.tsx    # Ticker tape + cards de cripto (Binance proxy)
│   │   └── animated-grid-bg.tsx
│   └── ui/                     # Componentes shadcn/ui (~40 componentes)
├── lib/
│   ├── api/
│   │   └── client.ts           # Axios instance + xpApi modules + JWT storage
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── stores/
│   ├── auth-store.ts           # Auth state + RBAC permissions matrix
│   ├── nav-store.ts            # Navegação SPA (currentPage + sidebar state)
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
```

---

## 4. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | **Sim** | URL base da API, **inclui `/api/v1`**. Ex: `https://api.xpayments.digital/api/v1` |
| `DATABASE_URL` | Não (dev) | String de conexão Prisma (SQLite local, apenas para desenvolvimento) |
| `NEXTAUTH_SECRET` | Não | Reservado para fluxo futuro |
| `NEXTAUTH_URL` | Não | Reservado para fluxo futuro |

**Arquivo de referência**: `.env.example`

```
NEXT_PUBLIC_API_URL="https://api.xpayments.digital/api/v1"
```

> **Atenção**: `NEXT_PUBLIC_API_URL` já inclui o prefixo `/api/v1`. O client Axios concatena as rotas diretamente a partir deste base URL. Nunca adicione `/api/v1` nas chamadas individuais.

---

## 5. API Client — Axios com JWT Interceptors

O client HTTP é implementado em `src/lib/api/client.ts` utilizando **Axios** com dois interceptors:

### Request Interceptor
Injeta automaticamente o header `Authorization: Bearer <token>` em todas as requisições, lendo o token do `sessionStorage` (chave `xp_token`).

### Response Interceptor
Intercepta respostas com status **401** (Unauthorized), limpando o token e disparando o evento customizado `xp:unauthorized`, que aciona o logout global.

### Formato de Resposta da API

Todas as respostas do backend seguem o envelope padrão:

```typescript
interface XPaymentsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

O client faz o unwrap automaticamente — as funções do `xpApi` retornam `payload.data` diretamente.

### Helpers de Armazenamento

| Função | Descrição |
|--------|-----------|
| `getStoredToken()` | Lê `xp_token` do sessionStorage |
| `setStoredToken(token)` | Grava token no sessionStorage |
| `clearStoredToken()` | Remove token do sessionStorage |
| `getStoredUser<T>()` | Lê e desserializa `xp_user` do sessionStorage |
| `setStoredUser<T>(user)` | Grava user serializado no sessionStorage |
| `clearStoredUser()` | Remove user do sessionStorage |

---

## 6. Rotas da API — Mapeamento Completo

Todas as rotas são relativas a `NEXT_PUBLIC_API_URL` (que já contém `/api/v1`).

### Autenticação

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `POST` | `/auth/login` | `xpApi.auth.login` | Login com email/password |
| `POST` | `/auth/register` | `xpApi.auth.register` | Registro de nova conta |
| `GET` | `/auth/me` | `xpApi.auth.me` | Perfil do utilizador autenticado |

### Público (sem autenticação)

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/public/rates` | `xpApi.public.getRates` | Taxas de câmbio para o motor de swap |

### Dashboard

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

### Merchant

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/merchant/api-keys` | `xpApi.merchant.getApiKeys` | Lista chaves API do merchant |
| `POST` | `/merchant/api-keys/generate` | `xpApi.merchant.generateApiKey` | Gera nova chave API |
| `GET` | `/merchant/links` | `xpApi.merchant.getPaymentLinks` | Lista links de pagamento |
| `POST` | `/merchant/links` | `xpApi.merchant.createPaymentLink` | Cria novo link de pagamento |

### Tickets

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/tickets` | `xpApi.tickets.list` | Lista tickets (filtros: status, type, page) |
| `PATCH` | `/tickets/:id` | `xpApi.tickets.update` | Atualiza status/resolução do ticket |

### Admin

| Método | Rota | Módulo | Descrição |
|--------|------|--------|-----------|
| `GET` | `/organizations` | `xpApi.organizations.list` | Lista organizações |
| `GET` | `/users` | `xpApi.users.list` | Lista utilizadores (com paginação) |

---

## 7. Sistema de Tipos TypeScript

Todos os tipos estão centralizados em `src/types/xpayments.ts`, alinhados ao schema Prisma do backend.

### Enums Principais

| Enum | Valores |
|------|---------|
| `UserRole` | `customer`, `merchant`, `super_merchant`, `admin`, `operator` |
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
| `OperationTicket` | Ticket de operação (aprovação manual, upgrade KYC, etc.) |
| `PaymentLink` | Link de pagamento white-label |
| `ApiKey` | Chave API S2S para integração merchant |
| `KycProfile` | Perfil KYC com dados progressivos por tier |
| `FeeSchedule` | Agendamento de taxas por tier e tipo de transação |

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

**Páginas disponíveis**: `dashboard`, `wallets`, `deposits`, `swaps`, `payouts`, `transactions`, `kyc`, `admin-tickets`, `admin-users`, `admin-fees`, `admin-organizations`, `merchant-links`, `merchant-api-keys`, `merchant-checkouts`

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

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Landing  │ ──────────────────────▶   │  Backend  │
│  Page     │ ◀──────────────────────   │  API      │
└──────────┘  { token, user, merchantId }└──────────┘
      │
      ▼
┌──────────────────────────────────────┐
│ 1. setAuth(token, user)              │  ← Zustand store
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
| `xp:unauthorized` | Quando interceptor recebe 401 | Logout automático + limpa sessão |

### Auto-Logout

O response interceptor do Axios captura qualquer resposta com status `401`, executa `clearStoredToken()` + `clearStoredUser()` e dispara `xp:unauthorized`. O componente raiz (`page.tsx`) escuta este evento e executa o logout via `useAuthStore`.

---

## 11. Navegação & View Routing

A aplicação utiliza um **SPA-like view routing** dentro do App Router do Next.js:

- `src/app/page.tsx` é o componente raiz que decide o que renderizar com base no estado `isAuthenticated`
- Não autenticado → renderiza `<XPaymentsLanding />`
- Autenticado → renderiza sidebar + página atual baseada em `useNavStore().currentPage`

O mapeamento de páginas é definido no objeto `PAGES` em `page.tsx`, associando cada `NavPage` ao seu componente React correspondente.

### Seções da Sidebar

| Seção | Páginas | Roles com acesso |
|-------|---------|-----------------|
| (root) | Painel | Todos |
| WALLET | Carteiras, Depositar, Swap, Payouts, Transações | Customer, Merchant, Super Merchant |
| VERIFICAÇÃO | Verificação KYC | Customer, Merchant, Super Merchant |
| MERCHANT | Links de Pagamento, API Keys, Checkouts | Merchant, Super Merchant |
| ADMIN | Aprovações, Liquidez, Utilizadores, Organizações | Operator |

---

## 12. Depósitos — Métodos & Fluxo

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

## 13. Payouts — Fluxo de Saída

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

## 14. Design System — Dark Control Tower

### Paleta Principal

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-neon` / `neon-400` | `#00FF7F` | Cor de destaque primária (neon green) |
| `neon-500` | `#00E672` | Gradientes, botões principais |
| `neon-600` | `#00CC66` | Gradientes (início), hovers |
| `neon-950` | `#003319` | Backgrounds de alto contraste |
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

### Componentes

- **shadcn/ui** (estilo New York) como base
- **Sonner** para toasts (position: `top-right`, `richColors`)
- Cards com `bg-zinc-900/50 border-zinc-800` e backdrop-blur
- Botões principais com gradiente `from-neon-600 to-neon-500`
- Badges com variantes outline em `border-zinc-700 bg-zinc-900`

---

## 15. Design Responsivo — Mobile-First

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

---

## 16. SEO & Metadados

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

## 17. Landing Page

A landing page utiliza a estética **Dark Control Tower** com tom de fundo `#0A0E1A` e destaques em neon green (`#00FF7F`).

### Seções Principais

- **Header**: Logo XPayments + navegação + botões Login/Registro
- **Hero**: Headline, descrição e formulário de autenticação inline (login/register toggle)
- **Features**: 4 cards (Multi-Wallet, Motor de Swap, KYC Progressivo, Infraestrutura Segura)
- **Mercado**: Ticker tape de cripto com dados do Binance via proxy local + cards de preço com sparklines
- **Moedas Suportadas**: Seção nativa dark-themed exibindo EUR, BRL, USDT e USD com ícones e descrições

> O widget TradingView foi removido e substituído pela seção nativa "Moedas Suportadas" com design consistente com o tema dark.

---

## 18. Deploy

### Vercel (Recomendado)

Variável de ambiente obrigatória:
```
NEXT_PUBLIC_API_URL=https://api.xpayments.digital/api/v1
```

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

## 19. Setup & Desenvolvimento

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

---

## 20. Licença

Projeto proprietário — **UNLICENSED**. Todos os direitos reservados a XPayments.Digital.