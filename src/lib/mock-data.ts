// ============================================================
// XPAYMENTS CORE - Mock Data para Desenvolvimento
// Estes dados simulam as respostas da API REST do XPayments.Digital.
// Quando a API real estiver conectada, este ficheiro será removido.
// ============================================================

import {
  type Wallet,
  type Transaction,
  type FeeSchedule,
  type KycProfile,
  type OperationTicket,
  type TierLimits,
  Currency,
  TierLevel,
  TransactionType,
  TransactionStatus,
  TicketType,
  TicketStatus,
  AccountStatus,
} from '@/types/xpayments';

// --- Current Authenticated User ---
export const mockAuthUser = {
  id: 'usr_01abc234',
  email: 'admin@xpayments.digital',
  nickname: 'XPaymentsAdmin',
  fullName: 'Admin XPayments',
  role: 'admin' as const,
  tier: TierLevel.TIER_3_CORPORATE,
  organizationId: 'org_xpcorp_001',
  organizationName: 'XPAYMENTS GLOBAL',
  avatar: null,
};

// --- Mock Wallets ---
export const mockWallets: Wallet[] = [
  {
    id: 'wal_eur_001',
    walletReference: 'XPAYMENTS-EUR-001',
    userId: 'usr_01abc234',
    currency: Currency.EUR,
    balanceIncoming: 2500.00,
    balancePending: 1250.50,
    balanceAvailable: 18500.75,
    balanceBlocked: 500.00,
    transactions: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-01-10T15:30:00Z',
  },
  {
    id: 'wal_brl_001',
    walletReference: 'XPAYMENTS-BRL-001',
    userId: 'usr_01abc234',
    currency: Currency.BRL,
    balanceIncoming: 5000.00,
    balancePending: 3200.00,
    balanceAvailable: 45000.00,
    balanceBlocked: 1500.00,
    transactions: [],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2025-01-10T16:00:00Z',
  },
  {
    id: 'wal_usdt_001',
    walletReference: 'XPAYMENTS-USDT-001',
    userId: 'usr_01abc234',
    currency: Currency.USDT,
    blockchainAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
    balanceIncoming: 1200.00,
    balancePending: 800.00,
    balanceAvailable: 15200.00,
    balanceBlocked: 0,
    transactions: [],
    createdAt: '2024-03-01T12:00:00Z',
    updatedAt: '2025-01-10T14:00:00Z',
  },
  {
    id: 'wal_usd_001',
    walletReference: 'XPAYMENTS-USD-001',
    userId: 'usr_01abc234',
    currency: Currency.USD,
    balanceIncoming: 0,
    balancePending: 0,
    balanceAvailable: 8500.00,
    balanceBlocked: 200.00,
    transactions: [],
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2025-01-09T11:00:00Z',
  },
];

// --- Mock Transactions ---
export const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    walletId: 'wal_eur_001',
    userId: 'usr_01abc234',
    type: TransactionType.PROXY_INCOMING,
    status: TransactionStatus.COMPLETED,
    amount: 5000.00,
    feeApplied: 0,
    currency: Currency.EUR,
    description: 'Depósito via Transferência',
    proxyReference: 'pm_1OxR4k2eZvKYlo2C',
    createdAt: '2025-01-10T15:30:00Z',
    updatedAt: '2025-01-10T15:35:00Z',
  },
  {
    id: 'tx_002',
    walletId: 'wal_brl_001',
    userId: 'usr_01abc234',
    type: TransactionType.PROXY_INCOMING,
    status: TransactionStatus.PENDING,
    amount: 15000.00,
    feeApplied: 0,
    currency: Currency.BRL,
    description: 'PIX - XPayments',
    proxyReference: 'pix_mistic_987654',
    createdAt: '2025-01-10T14:00:00Z',
    updatedAt: '2025-01-10T14:00:00Z',
  },
  {
    id: 'tx_003',
    walletId: 'wal_eur_001',
    userId: 'usr_01abc234',
    type: TransactionType.SWAP,
    status: TransactionStatus.COMPLETED,
    amount: 2500.00,
    feeApplied: 12.50,
    currency: Currency.EUR,
    description: 'Swap EUR → USDT',
    createdAt: '2025-01-10T13:00:00Z',
    updatedAt: '2025-01-10T13:01:00Z',
  },
  {
    id: 'tx_004',
    walletId: 'wal_usdt_001',
    userId: 'usr_01abc234',
    type: TransactionType.PAYOUT,
    status: TransactionStatus.COMPLETED,
    amount: 3000.00,
    feeApplied: 30.00,
    currency: Currency.USDT,
    description: 'Levantamento para carteira externa',
    onrampReference: '0xabc...def',
    createdAt: '2025-01-09T16:00:00Z',
    updatedAt: '2025-01-09T16:05:00Z',
  },
  {
    id: 'tx_005',
    walletId: 'wal_usd_001',
    userId: 'usr_01abc234',
    type: TransactionType.FEE,
    status: TransactionStatus.COMPLETED,
    amount: 15.00,
    feeApplied: 0,
    currency: Currency.USD,
    description: 'Taxa de processamento mensal',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:01Z',
  },
  {
    id: 'tx_006',
    walletId: 'wal_eur_001',
    userId: 'usr_01abc234',
    type: TransactionType.TRANSFER,
    status: TransactionStatus.INCOMING,
    amount: 2500.00,
    feeApplied: 0,
    currency: Currency.EUR,
    description: 'Transferência recebida',
    createdAt: '2025-01-10T17:00:00Z',
    updatedAt: '2025-01-10T17:00:00Z',
  },
];

// --- Mock Fee Schedules ---
export const mockFeeSchedules: FeeSchedule[] = [
  { id: 'fee_001', tier: TierLevel.TIER_1_BASIC, transactionType: TransactionType.PROXY_INCOMING, currency: Currency.EUR, percentageFee: 0.0150, fixedFee: 0.50, isManualOverride: false },
  { id: 'fee_002', tier: TierLevel.TIER_1_BASIC, transactionType: TransactionType.PAYOUT, currency: Currency.USDT, percentageFee: 0.0100, fixedFee: 2.00, isManualOverride: false },
  { id: 'fee_003', tier: TierLevel.TIER_1_BASIC, transactionType: TransactionType.SWAP, percentageFee: 0.0050, fixedFee: 0, isManualOverride: false },
  { id: 'fee_004', tier: TierLevel.TIER_2_VERIFIED, transactionType: TransactionType.PROXY_INCOMING, currency: Currency.EUR, percentageFee: 0.0100, fixedFee: 0.25, isManualOverride: false },
  { id: 'fee_005', tier: TierLevel.TIER_2_VERIFIED, transactionType: TransactionType.PAYOUT, currency: Currency.USDT, percentageFee: 0.0075, fixedFee: 1.00, isManualOverride: false },
  { id: 'fee_006', tier: TierLevel.TIER_2_VERIFIED, transactionType: TransactionType.SWAP, percentageFee: 0.0030, fixedFee: 0, isManualOverride: false },
  { id: 'fee_007', tier: TierLevel.TIER_3_CORPORATE, transactionType: TransactionType.PROXY_INCOMING, currency: Currency.EUR, percentageFee: 0.0050, fixedFee: 0.10, isManualOverride: false },
  { id: 'fee_008', tier: TierLevel.TIER_3_CORPORATE, transactionType: TransactionType.PAYOUT, currency: Currency.USDT, percentageFee: 0.0050, fixedFee: 0.50, isManualOverride: false },
  { id: 'fee_009', tier: TierLevel.TIER_3_CORPORATE, transactionType: TransactionType.SWAP, percentageFee: 0.0015, fixedFee: 0, isManualOverride: false },
];

// --- Mock KYC Profile ---
export const mockKycProfile: KycProfile = {
  tier: TierLevel.TIER_3_CORPORATE,
  updatedAt: '2024-12-15T10:00:00Z',
  data: {
    tier1: {
      fullName: 'Admin XPayments',
      nickname: 'XPaymentsAdmin',
      region: 'EU',
      contactMethod: 'email',
      contactValue: 'admin@xpayments.digital',
    },
    tier2: {
      taxId: '123456789',
      dateOfBirth: '1990-01-15',
      address: 'Rua Principal, 123',
      city: 'Lisboa',
      country: 'Portugal',
      postalCode: '1000-001',
    },
    tier3: {
      verificationUrl: 'https://verify.xpayments.digital/kyc/xyz',
      verifiedAt: '2024-12-15T10:00:00Z',
      provider: 'XPayments.Verify',
    },
  },
};

// --- Mock Tickets ---
export const mockTickets: OperationTicket[] = [
  {
    id: 'tkt_001',
    organizationId: 'org_xpcorp_001',
    email: 'ops@xpayments.digital',
    role: 'OPERATOR' as any,
    type: TicketType.MANUAL_WITHDRAWAL,
    status: TicketStatus.OPEN,
    description: 'Levantamento manual de 50,000 USDT para conta bancária corporativa.',
    createdAt: '2025-01-10T16:00:00Z',
    updatedAt: '2025-01-10T16:00:00Z',
  },
  {
    id: 'tkt_002',
    organizationId: 'org_xpcorp_001',
    email: 'kyc@xpayments.digital',
    role: 'ADMIN' as any,
    type: TicketType.TIER_UPGRADE,
    status: TicketStatus.IN_PROGRESS,
    description: 'Upgrade de KYC-2 para KYC-3 para cliente "XPayments Corp Corp".',
    createdAt: '2025-01-10T14:00:00Z',
    updatedAt: '2025-01-10T15:00:00Z',
  },
  {
    id: 'tkt_003',
    organizationId: 'org_xpcorp_001',
    email: 'ops@xpayments.digital',
    role: 'OPERATOR' as any,
    type: TicketType.FEE_ADJUSTMENT,
    status: TicketStatus.RESOLVED,
    description: 'Ajuste de fee para cliente VIP - redução de 1.5% para 0.5% em swaps.',
    resolutionNotes: 'Aprovado pelo Admin. Fee atualizada com sucesso.',
    createdAt: '2025-01-09T10:00:00Z',
    updatedAt: '2025-01-09T12:00:00Z',
  },
  {
    id: 'tkt_004',
    organizationId: 'org_xpcorp_001',
    email: 'support@xpayments.digital',
    role: 'OPERATOR' as any,
    type: TicketType.SUPPORT,
    status: TicketStatus.OPEN,
    description: 'Cliente reporta que depósito PIX não foi creditado após 2h.',
    createdAt: '2025-01-10T17:00:00Z',
    updatedAt: '2025-01-10T17:00:00Z',
  },
];

// --- Mock Organizations ---
export const mockOrganizations = [
  { id: 'org_xpcorp_001', name: 'XPAYMENTS GLOBAL', apiKey: 'xp_sk_live_xxxxx', users: [], operators: [], tickets: [], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'org_xpcorp_002', name: 'XPayments Corp', apiKey: 'xp_sk_live_yyyyy', users: [], operators: [], tickets: [], createdAt: '2024-02-15T00:00:00Z' },
  { id: 'org_merchant_003', name: 'XPayments Demo Store LTDA', apiKey: null, users: [], operators: [], tickets: [], createdAt: '2024-06-01T00:00:00Z' },
];

// --- Mock Users ---
export const mockUsers = [
  { id: 'usr_01abc234', nickname: 'XPaymentsAdmin', email: 'admin@xpayments.digital', fullName: 'Admin XPayments', tier: TierLevel.TIER_3_CORPORATE, status: AccountStatus.ACTIVE, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2025-01-10T15:30:00Z' },
  { id: 'usr_merchant_001', nickname: 'CryptoSeller', email: 'seller@cryptoshop.com', fullName: 'João Silva', tier: TierLevel.TIER_2_VERIFIED, status: AccountStatus.ACTIVE, createdAt: '2024-06-01T08:00:00Z', updatedAt: '2025-01-08T12:00:00Z' },
  { id: 'usr_customer_001', nickname: 'Buyer2024', email: 'buyer@email.com', fullName: 'Maria Santos', tier: TierLevel.TIER_1_BASIC, status: AccountStatus.ACTIVE, createdAt: '2024-09-01T14:00:00Z', updatedAt: '2025-01-05T09:00:00Z' },
  { id: 'usr_unverified_001', nickname: null, email: 'newuser@email.com', fullName: null, tier: TierLevel.TIER_0_UNVERIFIED, status: AccountStatus.ACTIVE, createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z' },
];

// --- Tier Limits ---
export const mockTierLimits: TierLimits[] = [
  {
    tier: TierLevel.TIER_0_UNVERIFIED,
    label: 'KYC-0',
    description: 'Acesso básico, limites restritos',
    maxTransactionLimit: 100,
    dailyLimit: 500,
    monthlyLimit: 2000,
    currencies: [Currency.BRL],
    features: ['Receber pagamentos', 'Ver saldo'],
  },
  {
    tier: TierLevel.TIER_1_BASIC,
    label: 'KYC-1',
    description: 'Registo inicial com limites moderados',
    maxTransactionLimit: 1000,
    dailyLimit: 5000,
    monthlyLimit: 20000,
    currencies: [Currency.BRL, Currency.EUR, Currency.USD],
    features: ['Depositar', 'Swap', 'Sacar', 'Ver histórico'],
  },
  {
    tier: TierLevel.TIER_2_VERIFIED,
    label: 'KYC-2',
    description: 'Verificação declarativa, taxas reduzidas',
    maxTransactionLimit: 10000,
    dailyLimit: 50000,
    monthlyLimit: 200000,
    currencies: [Currency.BRL, Currency.EUR, Currency.USD, Currency.USDT],
    features: ['Limites aumentados', 'Taxas reduzidas', 'API básica'],
  },
  {
    tier: TierLevel.TIER_3_CORPORATE,
    label: 'KYC-3',
    description: 'Conta corporativa, acesso total',
    maxTransactionLimit: 100000,
    dailyLimit: 500000,
    monthlyLimit: 5000000,
    currencies: [Currency.BRL, Currency.EUR, Currency.USD, Currency.USDT],
    features: ['Limites corporativos', 'Taxas institucionais', 'API completa', 'Payment Links', 'Checkout personalizado'],
  },
];

// --- Gateway Routes ---
export const mockDepositRoutes = {
  BRL: [
    { provider: 'XPayments', currencies: [Currency.BRL], minAmount: 10, maxAmount: 50000, estimatedTime: 'Instantâneo (PIX)', icon: '💵' },
  ],
  EUR: [
    { provider: 'XPayments', currencies: [Currency.EUR], minAmount: 5, maxAmount: 25000, estimatedTime: '1-2 dias úteis', icon: '💳' },
  ],
  USD: [
    { provider: 'XPayments', currencies: [Currency.USD], minAmount: 5, maxAmount: 25000, estimatedTime: '1-2 dias úteis', icon: '💳' },
  ],
};

// --- Helpers ---
export const currencySymbols: Record<Currency, string> = {
  [Currency.EUR]: '€',
  [Currency.BRL]: 'R$',
  [Currency.USDT]: '₮',
  [Currency.USD]: '$',
};

export const currencyColors: Record<Currency, string> = {
  [Currency.EUR]: 'text-blue-400',
  [Currency.BRL]: 'text-green-400',
  [Currency.USDT]: 'text-neon-400',
  [Currency.USD]: 'text-amber-400',
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.PROXY_INCOMING]: 'Depósito',
  [TransactionType.SETTLEMENT]: 'Settlement',
  [TransactionType.PAYOUT]: 'Levantamento',
  [TransactionType.SWAP]: 'Swap',
  [TransactionType.TRANSFER]: 'Transferência',
  [TransactionType.FEE]: 'Taxa',
};

export const transactionStatusColors: Record<TransactionStatus, string> = {
  [TransactionStatus.INCOMING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TransactionStatus.PENDING]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [TransactionStatus.COMPLETED]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [TransactionStatus.BLOCKED]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [TransactionStatus.FAILED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const ticketTypeLabels: Record<TicketType, string> = {
  [TicketType.MANUAL_WITHDRAWAL]: 'Levantamento Manual',
  [TicketType.TIER_UPGRADE]: 'Upgrade KYC',
  [TicketType.FEE_ADJUSTMENT]: 'Ajuste de Taxa',
  [TicketType.SUPPORT]: 'Suporte',
};

export const ticketStatusColors: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [TicketStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [TicketStatus.RESOLVED]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [TicketStatus.REJECTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
};
