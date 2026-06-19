'use client';

import React, { useRef, useEffect, useState, useCallback, type KeyboardEvent } from 'react';
import { X, SendHorizontal, Sparkles } from 'lucide-react';
import { useChatStore, type ChatMessage } from '@/stores/chat-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ── Suggestion Chips ──
const SUGGESTIONS = ['Ver saldos', 'Transações recentes', 'Ajuda com KYC'];

// ── Custom AI Avatar (gradient monogram) ──
function AiAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: { container: 'size-7', text: 'text-[10px]', ring: 'ring-[1.5px]' },
    md: { container: 'size-10', text: 'text-xs', ring: 'ring-2' },
    lg: { container: 'size-14', text: 'text-base', ring: 'ring-2' },
  };
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full',
        'bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400',
        'flex items-center justify-center',
        'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        s.container,
      )}
    >
      <span
        className={cn(
          'font-bold text-black/90 tracking-tighter leading-none select-none',
          s.text,
        )}
      >
        XP
      </span>
      {/* Outer glow ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'ring-emerald-400/30',
          s.ring,
        )}
      />
    </div>
  );
}

// ── Typing Indicator ──
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-1">
      <AiAvatar size="sm" />
      <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3 border border-white/[0.04]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ── Single Message Bubble ──
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center px-4 py-1">
        <span className="text-zinc-600 text-[11px] bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.04]">
          {message.content}
        </span>
      </div>
    );
  }

  const time = new Date(message.timestamp).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn('flex items-start gap-2.5 px-4 py-0.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* AI avatar on assistant messages */}
      {!isUser && <AiAvatar size="sm" />}

      <div className={cn('max-w-[82%] flex flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-zinc-100 rounded-2xl rounded-br-sm border border-emerald-500/10'
              : 'bg-white/[0.04] text-zinc-200 rounded-2xl rounded-bl-sm border border-white/[0.05]',
          )}
        >
          {message.content}
        </div>
        <span
          className={cn(
            'text-[10px] text-zinc-600 mt-1 px-1',
            isUser ? 'text-right' : 'text-left',
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

// ── Welcome State ──
function WelcomeState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-8">
      {/* Animated avatar with glow */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <AiAvatar size="lg" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-zinc-100">
          Olá! Sou o assistente XPayments.
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Posso ajudar com saldos, transações, KYC e muito mais.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className={cn(
              'text-[11px] px-3.5 py-1.5 rounded-full',
              'border border-white/[0.08] bg-white/[0.03] text-zinc-400',
              'hover:text-emerald-300 hover:border-emerald-500/25 hover:bg-emerald-500/5',
              'transition-all duration-200 cursor-pointer',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──
export default function XpAiChat() {
  const {
    isOpen,
    messages,
    isLoading,
    toggleChat,
    closeChat,
    addMessage,
    setLoading,
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll on new messages or loading change ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Focus input when chat opens ──
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── Send message handler ──
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    addMessage({ role: 'user', content: text });
    setInputValue('');
    setLoading(true);

    try {
      const { useAuthStore } = await import('@/stores/auth-store');
      const token = useAuthStore.getState().token;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...useChatStore.getState().messages],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage({
          role: 'system',
          content: data.error || 'Erro de conexão. Tente novamente.',
        });
        return;
      }

      const assistantContent = data?.data?.content || data?.content || data?.message || 'Sem resposta disponível.';
      addMessage({ role: 'assistant', content: assistantContent });
    } catch {
      addMessage({
        role: 'system',
        content: 'Erro de conexão. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }, [inputValue, isLoading, addMessage, setLoading]);

  // ── Keyboard handler ──
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Suggestion chip click ──
  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <>
      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-50',
            'w-[calc(100vw-2rem)] max-w-[380px] h-[520px]',
            'rounded-2xl border border-white/[0.08] bg-[#0a0a0d]/95',
            'backdrop-blur-2xl shadow-2xl shadow-black/60',
            'flex flex-col overflow-hidden',
            'animate-in slide-in-from-bottom-4 fade-in-0 duration-200',
          )}
        >
          {/* ── Panel Header ── */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AiAvatar size="sm" />
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0d] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-zinc-100 leading-tight">
                    XPayments AI
                  </span>
                  <Sparkles className="size-3 text-emerald-400" />
                </div>
                <span className="text-[10px] text-emerald-400/70 leading-tight mt-0.5">
                  Online · Pronto a ajudar
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] rounded-lg"
              aria-label="Fechar chat"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* ── Messages Area ── */}
          <div ref={scrollRef} className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {showWelcome ? (
                <WelcomeState onSuggestionClick={handleSuggestionClick} />
              ) : (
                <div className="flex flex-col gap-3 py-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>

          {/* ── Input Area ── */}
          <div className="shrink-0 border-t border-white/[0.06] p-3 bg-white/[0.015]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva a sua mensagem..."
                disabled={isLoading}
                className={cn(
                  'flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl',
                  'px-3.5 py-2.5 text-[13px] text-zinc-100 placeholder:text-zinc-600',
                  'outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/15',
                  'transition-all duration-200 disabled:opacity-50',
                )}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className={cn(
                  'h-10 w-10 shrink-0 rounded-xl',
                  'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300',
                  'text-black shadow-[0_0_16px_rgba(16,185,129,0.25)]',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
                  'transition-all duration-200',
                )}
                aria-label="Enviar mensagem"
              >
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={toggleChat}
        className={cn(
          'fixed bottom-6 right-6 z-50 group',
          'relative flex items-center justify-center',
        )}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {/* Animated gradient ring (visible when closed) */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 animate-[pulse_3s_ease-in-out_infinite] opacity-60 blur-md" />
        )}
        <span
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-full',
            'bg-gradient-to-br from-emerald-500 to-emerald-400',
            'text-black shadow-lg transition-all duration-200',
            'group-hover:scale-105 group-active:scale-95',
            'shadow-[0_0_24px_rgba(16,185,129,0.35)]',
            isOpen && 'from-zinc-700 to-zinc-600 text-zinc-200 shadow-[0_0_12px_rgba(0,0,0,0.4)]',
          )}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Sparkles className="h-6 w-6" />
          )}
        </span>
      </button>
    </>
  );
}