'use client';

import React, { useRef, useEffect, useState, useCallback, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { X, SendHorizontal, MessageSquare } from 'lucide-react';
import { useChatStore, type ChatMessage } from '@/stores/chat-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ── Suggestion Chips ──
const SUGGESTIONS = ['Ver saldos', 'Transações recentes', 'Ajuda com KYC'];

// ── AI Avatar using the actual XPayments logo ──
function AiAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: { wrapper: 'size-7', img: 14 },
    md: { wrapper: 'size-9', img: 18 },
    lg: { wrapper: 'size-16', img: 32 },
  };
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-xl overflow-hidden',
        'border border-white/[0.10] shadow-[0_0_10px_rgba(255,255,255,0.04)]',
        s.wrapper,
      )}
    >
      <Image
        src="/logo.png"
        alt="XPayments"
        width={s.img}
        height={s.img}
        className="size-full object-contain"
        unoptimized
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
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500/70 animate-pulse [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500/70 animate-pulse [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500/70 animate-pulse [animation-delay:300ms]" />
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
              ? 'bg-white/[0.08] text-zinc-100 rounded-2xl rounded-br-sm border border-white/[0.06]'
              : 'bg-white/[0.03] text-zinc-300 rounded-2xl rounded-bl-sm border border-white/[0.04]',
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
      {/* Logo avatar with subtle glow */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-white/[0.06] blur-2xl scale-125 animate-pulse" />
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
              'hover:text-zinc-200 hover:border-white/[0.15] hover:bg-white/[0.06]',
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
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] shrink-0 bg-white/[0.015]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AiAvatar size="sm" />
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border-2 border-[#0a0a0d]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-zinc-100 leading-tight">
                  XPayments AI
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight mt-0.5">
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
                  'outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.06]',
                  'transition-all duration-200 disabled:opacity-50',
                )}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className={cn(
                  'h-10 w-10 shrink-0 rounded-xl',
                  'bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 hover:text-zinc-100',
                  'border border-white/[0.08]',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                )}
                aria-label="Enviar mensagem"
              >
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-zinc-600 border-t-zinc-300 animate-spin" />
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
        {/* Subtle ambient glow (closed only) */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-white/[0.06] blur-xl animate-[pulse_4s_ease-in-out_infinite]" />
        )}
        <span
          className={cn(
            'relative flex h-13 w-13 items-center justify-center rounded-2xl p-2',
            'border border-white/[0.12]',
            'bg-[#1a1a1e]/90 backdrop-blur-md',
            'shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
            'transition-all duration-300 ease-out',
            'group-hover:scale-105 group-hover:border-white/[0.18] group-hover:shadow-[0_4px_32px_rgba(0,0,0,0.5)]',
            'group-active:scale-95',
            isOpen && 'bg-zinc-800/90 border-white/[0.08]',
          )}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-zinc-400" />
          ) : (
            <Image
              src="/logo.png"
              alt="XPayments AI"
              width={28}
              height={28}
              className="size-7 object-contain"
              unoptimized
            />
          )}
        </span>
      </button>
    </>
  );
}