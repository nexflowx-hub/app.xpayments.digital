// ============================================================
// XPAYMENTS.DIGITAL - TypeScript Types (Fonte da Verdade)
// Baseado rigorosamente no Prisma Schema do XPayments.Digital
// ============================================================

// --- ENUMS ---

export enum OrgRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  ACCOUNT_MANAGER = 'ACCOUNT_MANAGER',
}

export enum TierLevel {
  TIER_0_UNVERIFIED = 'TIER_0_UNVERIFIED',
  TIER_1_BASIC = 'TIER_1_BASIC',
  TIER_2_VERIFIED = 'TIER_2_VERIFIED',
  TIER_3_CORPORATE = 'TIER_3_CORPORATE',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum Currency {
  EUR = 'EUR',
  BRL = 'BRL',
  USDT = 'USDT',
  USD = 'USD',
}

export enum TransactionType {
  PROXY_INCOMING = 'PROXY_INCOMING',
  SETTLEMENT = 'SETTLEMENT',
  PAYOUT = 'PAYOUT',
  SWAP = 'SWAP',
  TRANSFER = 'TRANSFER',
  FEE = 'FEE',
}

export enum TransactionStatus {
  INCOMING = 'INCOMING',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  FAILED = 'FAILED',
}

export enum TicketType {
  MANUAL_WITHDRAWAL = 'MANUAL_WITHDRAWAL',
  TIER_UPGRADE = 'TIER_UPGRADE',
  FEE_ADJUSTMENT = 'FEE_ADJUSTMENT',
  SUPPORT = 'SUPPORT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

// --- CUSTOM TYPES ---

export type LedgerStatus = 'INCOMING' | 'PENDING' | 'RESERVE' | 'AVAILABLE' | 'CLEARED' | 'AUDIT' | 'BLOCKED';

// --- MODELS ---

/**
 * @deprecated Use Merchant instead. Organization is kept for backward compatibility.
 */
export interface Organization {
  id: string;
  name: string;
  apiKey?: string | null;
  users: User[];
  operators: OrgOperator[];
  tickets: OperationTicket[];
  createdAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  apiKey?: string | null;
  tier: string;
  reservePercent: number;
  users: User[];
  operators: OrgOperator[];
  tickets: OperationTicket[];
  createdAt: string;
}

export interface OrgOperator {
  id: string;
  organizationId: string;
  organization?: Organization;
  email: string;
  role: OrgRole;
  ticketsCreated: OperationTicket[];
  createdAt: string;
}

export interface User {
  id: string;
  organizationId?: string | null;
  organization?: Organization;
  nickname?: string | null;
  email?: string | null;
  phone?: string | null;
  telegramId?: string | null;
  fullName?: string | null;
  requiresPasswordChange: boolean;
  tier: TierLevel;
  status: AccountStatus;
  wallets: Wallet[];
  transactions: Transaction[];
  tickets: OperationTicket[];
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  walletReference: string;
  userId: string;
  user?: User;
  currency: Currency;
  blockchainAddress?: string | null;
  turnkeyWalletId?: string | null;
  balanceIncoming: number;
  balancePending: number;
  balanceAvailable: number;
  balanceBlocked: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface FeeSchedule {
  id: string;
  tier: TierLevel;
  transactionType: TransactionType;
  currency?: Currency | null;
  percentageFee: number;
  fixedFee: number;
  isManualOverride: boolean;
}

export interface SettlementBatch {
  id: string;
  batchNumber: string;
  processedAt: string;
  totalAmount: number;
  currency: Currency;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  walletId: string;
  wallet?: Wallet;
  userId: string;
  user?: User;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  feeApplied: number;
  currency: Currency;
  proxyReference?: string | null;
  onrampReference?: string | null;
  description?: string | null;
  batchId?: string | null;
  batch?: SettlementBatch | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationTicket {
  id: string;
  organizationId: string;
  organization?: Organization;
  creatorId: string;
  creator?: OrgOperator;
  targetUserId?: string | null;
  targetUser?: User | null;
  type: TicketType;
  status: TicketStatus;
  description: string;
  resolutionNotes?: string | null;
  resolvedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- WHITE-LABEL: Payment Methods ---

export interface PaymentMethod {
  id: string;
  network: string; // 'visa', 'mastercard', 'mbway', 'pix', 'usdt', etc.
  label: string;   // 'Visa', 'Mastercard', 'MBWAY', 'PIX', etc.
  icon?: string;
  enabled: boolean;
  currencies: Currency[];
}

// --- WHITE-LABEL: Payment Links ---

export interface PaymentLink {
  id: string;
  merchantId: string;
  amount: number;
  currency: Currency;
  description?: string;
  status: 'active' | 'expired' | 'cancelled';
  url: string;
  transactions: number;
  volume: number;
  createdAt: string;
}

// --- WHITE-LABEL: API Keys ---

export interface ApiKey {
  id: string;
  merchantId: string;
  storeName: string;
  keyPrefix: string;
  key: string;
  status: 'active' | 'revoked';
  lastUsed?: string;
  createdAt: string;
}

// --- API REQUEST / RESPONSE ---

export interface LoginRequest {
  xpId?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  storeName?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    merchantId: string;
    token: string;
    user: AuthUser;
  };
}

export interface AuthUser {
  id: string;
  email?: string | null;
  nickname?: string | null;
  fullName?: string | null;
  role: UserRole;
  tier?: TierLevel;
  organizationId?: string | null;
  organizationName?: string | null;
  avatar?: string | null;
}

export type UserRole = 'customer' | 'merchant' | 'super_merchant' | 'admin' | 'operator';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// --- XPAYMENTS.DIGITAL API WRAPPER ---
// O backend devolve respostas no formato { success: boolean, data: T }
export interface XPaymentsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * @deprecated Use XPaymentsApiResponse interface instead. Kept for backward compatibility.
 */
export type XPaymentsApiResult<T> = XPaymentsApiResponse<T>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- DEPOSIT / WITHDRAW / SWAP ---

export interface DepositRequest {
  walletId: string;
  currency: Currency;
  amount: number;
}

export interface DepositResponse {
  transactionId: string;
  provider: string;
  providerData: Record<string, unknown>;
  status: TransactionStatus;
}

export interface SwapRequest {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
}

export interface SwapResponse {
  transactionId: string;
  rate: number;
  feeApplied: number;
  fromAmount: number;
  toAmount: number;
  estimatedTime: string;
}

/**
 * @deprecated Use PayoutRequest instead. Kept for backward compatibility.
 */
export interface WithdrawRequest {
  walletId: string;
  amount: number;
  destinationAddress?: string;
  destinationBankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    accountType?: string;
    holderName: string;
  };
}

/**
 * @deprecated Use PayoutResponse instead. Kept for backward compatibility.
 */
export interface WithdrawResponse {
  transactionId: string;
  ticketId?: string;
  status: TransactionStatus;
  estimatedArrival: string;
}

// --- PAYOUTS (New) ---

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface PayoutRequest {
  amountUSDT: number;
  requestedCurrency: Currency;
  destinationInfo: string; // IBAN, Chave PIX, or crypto address
  status?: PayoutStatus;
}

export interface PayoutResponse {
  id: string;
  amountUSDT: number;
  requestedCurrency: Currency;
  destinationInfo: string;
  status: PayoutStatus;
  estimatedArrival: string;
  ticketId?: string; // Created if manual approval needed
  createdAt: string;
}

// --- DEPOSIT PROOF (New) ---

export interface DepositProofRequest {
  depositId: string;
  proofType: 'tx_hash' | 'receipt';
  proofValue: string;
}

export interface DepositProofResponse {
  depositId: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  message: string;
}

export interface GatewayRoute {
  provider: string;
  currencies: Currency[];
  minAmount: number;
  maxAmount: number;
  estimatedTime: string;
  icon?: string;
}

// --- KYC ---

export interface KycProfile {
  tier: TierLevel;
  updatedAt: string;
  data: {
    tier1?: {
      fullName: string;
      nickname: string;
      region: 'EU' | 'BR';
      contactMethod: 'email' | 'whatsapp' | 'telegram';
      contactValue: string;
    };
    tier2?: {
      taxId: string;
      dateOfBirth: string;
      address: string;
      city: string;
      country: string;
      postalCode: string;
    };
    tier3?: {
      verificationUrl?: string;
      verifiedAt?: string;
      provider?: string;
    };
  };
}

export interface KycUpgradeRequest {
  tier: TierLevel;
  data: Record<string, unknown>;
}

export interface KycUpgradeResponse {
  status: 'pending' | 'approved' | 'requires_verification';
  verificationUrl?: string;
  message: string;
}

// --- TIER LIMITS (UI Helpers) ---

export interface TierLimits {
  tier: TierLevel;
  label: string;
  description: string;
  maxTransactionLimit: number;
  dailyLimit: number;
  monthlyLimit: number;
  currencies: Currency[];
  features: string[];
}

// --- RBAC PERMISSIONS ---

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewWallets: boolean;
  canDeposit: boolean;
  canSwap: boolean;
  canWithdraw: boolean;
  canViewTransactions: boolean;
  canGeneratePaymentLinks: boolean;
  canManageApiKeys: boolean;
  canConfigureCheckouts: boolean;
  canViewSubClients: boolean;
  canManageTickets: boolean;
  canApproveKyc: boolean;
  canConfigureFees: boolean;
  canManageOrganizations: boolean;
  canManageUsers: boolean;
}

// --- NOVOS TIPOS: ANALYTICS, RISK & CRM (V2) ---

export interface AnalyticsOverview {
  timeframes: {
    today: number;
    month: number;
  };
  conversion: {
    rate: number;
    totalAttempts: number;
    successful: number;
  };
  financials: {
    grossProcessedUSDT: number;
    feesPaidUSDT: number;
    netRevenueUSDT: number;
  };
  currencySplit: Record<string, number>;
}

export interface RiskProfile {
  riskScore: number;
  securityStatus: 'SAFE' | 'REVIEW_NEEDED';
  reserve: {
    active: boolean;
    percentRetained: number;
    holdingPeriodDays: number;
  };
  metrics: {
    totalVolumeProcessed: number;
  };
}

export interface CustomerCRM {
  id: string;
  name: string | null;
  email: string;
  taxId: string | null;
  createdAt: string;
  stats: {
    totalPurchases: number;
    lifetimeValueUSDT: number;
    lastPurchaseAt: string | null;
  };
}
