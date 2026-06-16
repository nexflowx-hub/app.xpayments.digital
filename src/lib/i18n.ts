// ─────────────────────────────────────────────────────────────────────────────
// XPayments.Digital — Internationalization Store
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";

export type Locale = "pt-BR" | "en";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()((set) => ({
  locale: "pt-BR",
  setLocale: (locale) => set({ locale }),
}));

// ─── Translation Maps ────────────────────────────────────────────────────────

const translations: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    // Auth
    "auth.merchant_portal": "Portal do Lojista",
    "auth.restricted_access": "Acesso Restrito",
    "auth.high_risk_gateway": "Gateway de Pagamentos High-Risk",
    "auth.start_accepting": "Comece a receber pagamentos",
    "auth.admin_console_mfa": "Console de Administração — MFA Necessário",
    "auth.welcome_back": "Bem-vindo de volta",
    "auth.sign_in_subtitle": "Acesse seu painel de lojista",
    "auth.email": "E-mail",
    "auth.password": "Senha",
    "auth.sign_in": "Entrar",
    "auth.authenticating": "Autenticando...",
    "auth.no_account": "Não tem uma conta?",
    "auth.create_one": "Criar conta",
    "auth.admin_access": "Acesso Admin →",
    "auth.create_account": "Criar Conta",
    "auth.creating_account": "Criando conta...",
    "auth.already_have_account": "Já tem uma conta?",
    "auth.back_to_merchant": "← Voltar ao Login do Lojista",
    "auth.account_created": "Conta Criada",
    "auth.save_secret_now": "Salvar Agora",
    "auth.secret_key_warning": "Guarde sua Chave Secreta em um local seguro (gerenciador de senhas, arquivo criptografado). Se perder, precisará regenerá-la no painel. Nunca exponha em código client-side.",
    "auth.saved_key_continue": "Salvei minha chave — Ir para o Painel",
    "auth.unexpected_error": "Ocorreu um erro inesperado. Tente novamente.",
    "auth.admin_console": "Console Admin",
    "auth.mfa_required": "Autenticação multifator necessária",
    "auth.restricted_warning": "Esta é uma <span className=\"font-medium text-red-400\">área restrita</span>. Todas as ações são monitoradas e registradas. Tentativas de acesso não autorizado serão reportadas.",
    "auth.admin_email": "E-mail do Admin",
    "auth.mfa_code": "Código MFA",
    "auth.mfa_description": "Código de 6 dígitos do seu app autenticador",
    "auth.verifying_mfa": "Verificando MFA...",
    "auth.access_admin": "Acessar Painel Admin",
    "auth.store_name": "Nome da Loja",
    "auth.store_name_placeholder": "Minha Loja Online",

    // Dashboard
    "nav.overview": "Visão Geral",
    "nav.transactions": "Transações",
    "nav.payouts": "Saques",
    "nav.payment_links": "Links de Pagamento",
    "nav.compliance": "Conformidade",
    "nav.developers_api": "Desenvolvedores / API",
    "nav.settings_billing": "Configurações / Faturamento",
    "nav.support_upgrades": "Suporte & Upgrades",
    "nav.checkout_preview": "Pré-visualização do Checkout",
    "nav.settings": "Configurações",
    "nav.help_support": "Ajuda & Suporte",
    "nav.account_settings": "Configurações da Conta",
    "nav.logout": "Sair",

    // Overview
    "overview.title": "Visão Geral",
    "overview.subtitle": "Saldo em tempo real em todos os estados de liquidação. Todos os valores em USDT.",
    "overview.synced": "Sincronizado",
    "overview.api_connected": "API Conectada",
    "overview.fetching_from": "Buscando de",
    "overview.incoming": "Recebendo",
    "overview.incoming_desc": "Fundos recém-recebidos",
    "overview.pending": "Pendente",
    "overview.pending_desc": "Em trânsito D+1 a D+3",
    "overview.risk_reserve": "Reserva de Risco",
    "overview.risk_reserve_desc": "Retido pela conformidade",
    "overview.available": "Disponível para Saque",
    "overview.available_desc": "Pronto para pagamento",
    "overview.request_payout": "Solicitar Saque",
    "overview.total_states": "Total em todos os estados:",
    "overview.cleared": "Liquidado",
    "overview.under_audit": "Em Auditoria",
    "overview.blocked": "Bloqueado",
    "overview.unable_fetch": "Não foi possível buscar dados de saldo",
    "overview.check_connection": "Verifique sua conexão ou tente novamente.",
    "overview.retry": "Tentar Novamente",

    // Balance cards
    "balance.usdt": "USDT",

    // Payment Links
    "payment_links.title": "Links de Pagamento",
    "payment_links.subtitle": "Crie e gerencie links de checkout hospedados para seus produtos.",
    "payment_links.create_new": "Criar Novo Link",
    "payment_links.total_links": "Total de Links",
    "payment_links.active": "Ativos",
    "payment_links.total_sales": "Total de Vendas",
    "payment_links.total_clicks": "Total de Cliques",
    "payment_links.error": "Erro",
    "payment_links.failed_load": "Falha ao carregar links de pagamento",
    "payment_links.link_created": "Link de pagamento criado com sucesso",
    "payment_links.link_ready": "Seu novo link de checkout está pronto para compartilhar.",
    "payment_links.failed_create": "Falha ao criar link",
    "payment_links.failed_create_desc": "Algo deu errado. Tente novamente.",

    // Developers
    "developers.title": "Desenvolvedores / API",
    "developers.subtitle": "Gerencie suas chaves de API, explore trechos de código e configure eventos de webhook.",
    "developers.api_keys": "Chaves de API",
    "developers.public_key": "Chave Pública",
    "developers.public_key_desc": "Segura para uso em código client-side. Não acessa dados sensíveis.",
    "developers.secret_key": "Chave Secreta",
    "developers.secret_key_desc": "Mantenha em segredo. Nunca exponha em código client-side ou repositórios públicos.",
    "developers.quick_start": "Início Rápido",
    "developers.webhook_events": "Eventos de Webhook",

    // Settings
    "settings.title": "Configurações / Faturamento",
    "settings.subtitle": "Configure sua carteira USDT de saque e gerencie métodos de pagamento ativos.",
    "settings.wallet_title": "Carteira USDT de Saque",
    "settings.wallet_config": "Configuração da Carteira",
    "settings.wallet_desc": "Configure a carteira onde seus saques em USDT serão enviados. Todos os pagamentos são processados em USDT (Tether) na rede escolhida.",
    "settings.wallet_address": "Endereço da Carteira",
    "settings.network": "Rede",
    "settings.label": "Rótulo",
    "settings.label_desc": "Um apelido para identificar esta carteira (ex: \"Operações Principais\")",
    "settings.save_wallet": "Salvar Carteira",
    "settings.wallet_saved": "Carteira Salva ✓",
    "settings.active_methods": "Métodos de Pagamento Ativos",
    "settings.configure": "Configurar",
    "settings.active": "Ativo",
    "settings.pending_activation": "Ativação Pendente",
    "settings.disabled": "Desativado",
    "settings.whitelabel_notice": "A XPayments gerencia toda a infraestrutura de processamento de pagamentos de forma transparente. Seus métodos configurados são otimizados para as melhores taxas de aprovação e velocidade de liquidação. Nenhuma configuração de gateway de terceiros necessária.",
    "settings.network_info": "Os métodos de pagamento são gerenciados e otimizados pela XPayments para máxima taxa de aprovação. Os ícones de rede representam bandeiras de cartão e redes de pagamento aceitas. Contate o suporte para solicitar métodos adicionais.",

    // Support
    "support.title": "Suporte & Upgrades",
    "support.subtitle": "Obtenha ajuda da nossa equipe ou solicite um upgrade de tier para melhores condições de liquidação.",
    "support.open_ticket": "Abrir Chamado de Suporte",
    "support.subject": "Assunto",
    "support.category": "Categoria",
    "support.priority": "Prioridade",
    "support.description": "Descrição",
    "support.submit_ticket": "Enviar Chamado",
    "support.ticket_submitted": "Chamado Enviado",
    "support.tier_upgrade": "Upgrade de Tier",
    "support.tier_comparison": "Comparação de Tiers de Liquidação",
    "support.tier_upgrade_desc": "Faça upgrade do seu tier para liquidações mais rápidas, taxas menores e limites maiores.",
    "support.current": "Atual",
    "support.target": "Alvo",
    "support.request_upgrade": "Solicitar Upgrade para Tier A",
    "support.requirements": "Requisitos",
    "support.cancel": "Cancelar",
    "support.submit_request": "Enviar Solicitação",
    "support.request_submitted": "Solicitação Enviada",
    "support.recent_tickets": "Chamados Recentes",
    "support.open": "Aberto",
    "support.in_progress": "Em Andamento",
    "support.resolved": "Resolvido",
    "support.low": "Baixa",
    "support.medium": "Média",
    "support.high": "Alta",

    // Checkout Preview
    "checkout.title": "Pré-visualização do Checkout",
    "checkout.subtitle": "Pré-visualização da experiência de checkout white-label hospedado. Nenhuma marca de terceiro é exposta ao cliente final.",
    "checkout.whitelabel_active": "Checkout White-Label Ativo",
    "checkout.whitelabel_desc": "A página de checkout exibida abaixo usa apenas a marca XPayments. Nenhum nome, logo ou identificador de provedor de pagamento é visível para o cliente pagador. Todo o processamento é abstraído.",
    "checkout.order_summary": "Resumo do Pedido",
    "checkout.order_id": "ID do Pedido",
    "checkout.payment_method": "Método de Pagamento",
    "checkout.card": "Cartão",
    "checkout.enter_card": "Insira os dados do seu cartão",
    "checkout.card_number": "Número do Cartão",
    "checkout.expiry": "Validade",
    "checkout.cvv": "CVV",
    "checkout.cardholder": "Nome no Cartão",
    "checkout.scan_qr": "Escaneie o QR code com o app do seu banco para completar o pagamento instantaneamente.",
    "checkout.instant_payment": "Pagamento Instantâneo",
    "checkout.send_usdt": "Envie USDT para",
    "checkout.send_exact": "Envie o valor exato em USDT. O pagamento é confirmado após verificação na blockchain.",
    "checkout.pay": "Pagar",
    "checkout.secured_by": "Protegido por",

    // Admin
    "admin.overview": "Visão Geral",
    "admin.merchants": "Lojistas",
    "admin.transaction_monitoring": "Monitoramento de Transações",
    "admin.payout_approvals": "Aprovações de Saque",
    "admin.payment_routing": "Roteamento de Pagamentos",
    "admin.support_tickets": "Chamados de Suporte",
    "admin.search_placeholder": "Buscar lojistas, transações...",
    "admin.all_actions_logged": "Todas as ações são registradas",
    "admin.admin_settings": "Configurações Admin",

    // Header
    "header.search_placeholder": "Buscar transações, saques...",
    "header.live": "Ao Vivo",

    // Footer
    "footer.copyright": "© 2026",
    "footer.settlement_engine": "Motor de Liquidação v1.0.0",

    // Placeholder
    "placeholder.under_construction": "Este módulo está em construção e estará disponível no próximo sprint.",
    "placeholder.coming_soon": "Em Breve",

    // Language
    "lang.pt": "PT",
    "lang.en": "EN",
  },
  en: {
    // Auth
    "auth.merchant_portal": "Merchant Portal",
    "auth.restricted_access": "Restricted Access",
    "auth.high_risk_gateway": "High-Risk Payment Gateway",
    "auth.start_accepting": "Start accepting payments",
    "auth.admin_console_mfa": "Administration Console — MFA Required",
    "auth.welcome_back": "Welcome back",
    "auth.sign_in_subtitle": "Sign in to your merchant dashboard",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.sign_in": "Sign In",
    "auth.authenticating": "Authenticating...",
    "auth.no_account": "Don't have an account?",
    "auth.create_one": "Create one",
    "auth.admin_access": "Admin Access →",
    "auth.create_account": "Create Account",
    "auth.creating_account": "Creating account...",
    "auth.already_have_account": "Already have an account?",
    "auth.back_to_merchant": "← Back to Merchant Login",
    "auth.account_created": "Account Created",
    "auth.save_secret_now": "Save Now",
    "auth.secret_key_warning": "Store your Secret Key in a secure location (password manager, encrypted file). If lost, you will need to regenerate it from the dashboard. Never expose it in client-side code.",
    "auth.saved_key_continue": "I've saved my key — Continue to Dashboard",
    "auth.unexpected_error": "An unexpected error occurred. Please try again.",
    "auth.admin_console": "Admin Console",
    "auth.mfa_required": "Multi-factor authentication required",
    "auth.restricted_warning": "This is a <span className=\"font-medium text-red-400\">restricted area</span>. All actions are monitored and logged. Unauthorized access attempts will be reported.",
    "auth.admin_email": "Admin Email",
    "auth.mfa_code": "MFA Code",
    "auth.mfa_description": "6-digit code from your authenticator app",
    "auth.verifying_mfa": "Verifying MFA...",
    "auth.access_admin": "Access Admin Panel",
    "auth.store_name": "Store Name",
    "auth.store_name_placeholder": "My Online Store",

    // Dashboard
    "nav.overview": "Overview",
    "nav.transactions": "Transactions",
    "nav.payouts": "Payouts",
    "nav.payment_links": "Payment Links",
    "nav.compliance": "Compliance",
    "nav.developers_api": "Developers / API",
    "nav.settings_billing": "Settings / Billing",
    "nav.support_upgrades": "Support & Upgrades",
    "nav.checkout_preview": "Checkout Preview",
    "nav.settings": "Settings",
    "nav.help_support": "Help & Support",
    "nav.account_settings": "Account Settings",
    "nav.logout": "Log out",

    // Overview
    "overview.title": "Overview",
    "overview.subtitle": "Real-time balance across all settlement states. All values in USDT.",
    "overview.synced": "Synced",
    "overview.api_connected": "API Connected",
    "overview.fetching_from": "Fetching from",
    "overview.incoming": "Incoming",
    "overview.incoming_desc": "Funds just received",
    "overview.pending": "Pending",
    "overview.pending_desc": "In transit D+1 to D+3",
    "overview.risk_reserve": "Risk Reserve",
    "overview.risk_reserve_desc": "Held by compliance",
    "overview.available": "Available to Withdraw",
    "overview.available_desc": "Ready for payout",
    "overview.request_payout": "Request Payout",
    "overview.total_states": "Total across all states:",
    "overview.cleared": "Cleared",
    "overview.under_audit": "Under Audit",
    "overview.blocked": "Blocked",
    "overview.unable_fetch": "Unable to fetch balance data",
    "overview.check_connection": "Check your connection or try again later.",
    "overview.retry": "Retry",

    // Balance cards
    "balance.usdt": "USDT",

    // Payment Links
    "payment_links.title": "Payment Links",
    "payment_links.subtitle": "Create and manage hosted checkout links for your products.",
    "payment_links.create_new": "Create New Link",
    "payment_links.total_links": "Total Links",
    "payment_links.active": "Active",
    "payment_links.total_sales": "Total Sales",
    "payment_links.total_clicks": "Total Clicks",
    "payment_links.error": "Error",
    "payment_links.failed_load": "Failed to load payment links",
    "payment_links.link_created": "Payment link created successfully",
    "payment_links.link_ready": "Your new checkout link is ready to share.",
    "payment_links.failed_create": "Failed to create link",
    "payment_links.failed_create_desc": "Something went wrong. Please try again.",

    // Developers
    "developers.title": "Developers / API",
    "developers.subtitle": "Manage your API keys, explore code snippets, and configure webhook events.",
    "developers.api_keys": "API Keys",
    "developers.public_key": "Public Key",
    "developers.public_key_desc": "Safe to use in client-side code. Cannot access sensitive data.",
    "developers.secret_key": "Secret Key",
    "developers.secret_key_desc": "Keep this secret. Never expose it in client-side code or public repositories.",
    "developers.quick_start": "Quick Start",
    "developers.webhook_events": "Webhook Events",

    // Settings
    "settings.title": "Settings / Billing",
    "settings.subtitle": "Configure your USDT payout wallet and manage active payment methods.",
    "settings.wallet_title": "USDT Payout Wallet",
    "settings.wallet_config": "Wallet Configuration",
    "settings.wallet_desc": "Configure the wallet where your USDT settlements will be sent. All payouts are processed in USDT (Tether) on your chosen network.",
    "settings.wallet_address": "Wallet Address",
    "settings.network": "Network",
    "settings.label": "Label",
    "settings.label_desc": "A nickname to identify this wallet (e.g. \"Main Operations\")",
    "settings.save_wallet": "Save Wallet",
    "settings.wallet_saved": "Wallet Saved ✓",
    "settings.active_methods": "Active Payment Methods",
    "settings.configure": "Configure",
    "settings.active": "Active",
    "settings.pending_activation": "Pending Activation",
    "settings.disabled": "Disabled",
    "settings.whitelabel_notice": "XPayments manages all payment processing infrastructure transparently. Your configured methods are optimized for the best approval rates and settlement speed. No third-party gateway configuration required.",
    "settings.network_info": "Payment methods are managed and optimized by XPayments for maximum approval rates. Network icons represent accepted card brands and payment networks. Contact support to request additional methods.",

    // Support
    "support.title": "Support & Upgrades",
    "support.subtitle": "Get help from our team or request a tier upgrade for better settlement terms.",
    "support.open_ticket": "Open Support Ticket",
    "support.subject": "Subject",
    "support.category": "Category",
    "support.priority": "Priority",
    "support.description": "Description",
    "support.submit_ticket": "Submit Ticket",
    "support.ticket_submitted": "Ticket Submitted",
    "support.tier_upgrade": "Tier Upgrade",
    "support.tier_comparison": "Settlement Tier Comparison",
    "support.tier_upgrade_desc": "Upgrade your tier for faster settlements, lower fees, and higher limits.",
    "support.current": "Current",
    "support.target": "Target",
    "support.request_upgrade": "Request Tier A Upgrade",
    "support.requirements": "Requirements",
    "support.cancel": "Cancel",
    "support.submit_request": "Submit Request",
    "support.request_submitted": "Request Submitted",
    "support.recent_tickets": "Recent Tickets",
    "support.open": "Open",
    "support.in_progress": "In Progress",
    "support.resolved": "Resolved",
    "support.low": "Low",
    "support.medium": "Medium",
    "support.high": "High",

    // Checkout Preview
    "checkout.title": "Checkout Preview",
    "checkout.subtitle": "Preview of the white-label hosted checkout experience. No third-party branding is exposed to the end customer.",
    "checkout.whitelabel_active": "White-Label Checkout Active",
    "checkout.whitelabel_desc": "The checkout page displayed below uses only XPayments branding. No backend payment provider names, logos, or identifiers are visible to the paying customer. All payment processing is abstracted.",
    "checkout.order_summary": "Order Summary",
    "checkout.order_id": "Order ID",
    "checkout.payment_method": "Payment Method",
    "checkout.card": "Card",
    "checkout.enter_card": "Enter your card details",
    "checkout.card_number": "Card Number",
    "checkout.expiry": "Expiry",
    "checkout.cvv": "CVV",
    "checkout.cardholder": "Cardholder Name",
    "checkout.scan_qr": "Scan the QR code with your banking app to complete the payment instantly.",
    "checkout.instant_payment": "Instant Payment",
    "checkout.send_usdt": "Send USDT to",
    "checkout.send_exact": "Send the exact USDT amount. Payment confirms after blockchain verification.",
    "checkout.pay": "Pay",
    "checkout.secured_by": "Secured by",

    // Admin
    "admin.overview": "Overview",
    "admin.merchants": "Merchants",
    "admin.transaction_monitoring": "Transaction Monitoring",
    "admin.payout_approvals": "Payout Approvals",
    "admin.payment_routing": "Payment Routing",
    "admin.support_tickets": "Support Tickets",
    "admin.search_placeholder": "Search merchants, transactions...",
    "admin.all_actions_logged": "All actions are logged",
    "admin.admin_settings": "Admin Settings",

    // Header
    "header.search_placeholder": "Search transactions, payouts...",
    "header.live": "Live",

    // Footer
    "footer.copyright": "© 2026",
    "footer.settlement_engine": "Settlement Engine v1.0.0",

    // Placeholder
    "placeholder.under_construction": "This module is under construction and will be available in the next sprint.",
    "placeholder.coming_soon": "Coming Soon",

    // Language
    "lang.pt": "PT",
    "lang.en": "EN",
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useT() {
  const { locale } = useI18nStore();

  function t(key: string): string {
    return translations[locale]?.[key] ?? translations["pt-BR"]?.[key] ?? key;
  }

  return { t, locale };
}