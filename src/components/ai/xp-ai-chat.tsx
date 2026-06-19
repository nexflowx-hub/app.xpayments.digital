'use client';

import React, { useRef, useEffect, useState, useCallback, type KeyboardEvent } from 'react';
import { Bot, X, SendHorizontal } from 'lucide-react';
import { useChatStore, type ChatMessage } from '@/stores/chat-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ── Suggestion Chips ──
const SUGGESTIONS = ['Ver saldos', 'Transações recentes', 'Ajuda com KYC'];

// ── Typing Indicator ──
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-1">
      <div className="flex items-center gap-1 bg-white/[0.05] rounded-2xl rounded-bl-md px-4 py-3">
        <span className="inline-block h-2 w-2 rounded-full bg-neon-500/50 animate-pulse [animation-delay:0ms]" />
        <span className="inline-block h-2 w-2 rounded-full bg-neon-500/50 animate-pulse [animation-delay:150ms]" />
        <span className="inline-block h-2 w-2 rounded-full bg-neon-500/50 animate-pulse [animation-delay:300ms]" />
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
        <span className="text-zinc-600 text-xs">{message.content}</span>
      </div>
    );
  }

  const time = new Date(message.timestamp).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn('flex px-4 py-1', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className="max-w-[85%] flex flex-col">
        <div
          className={cn(
            'px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-neon-500/15 text-zinc-100 rounded-2xl rounded-br-md'
              : 'bg-white/[0.05] text-zinc-200 rounded-2xl rounded-bl-md',
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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-500/10 border border-neon-500/20">
        <Bot className="h-6 w-6 text-neon-500" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm font-medium text-zinc-200">
          Olá! Sou o assistente da XPayments.
        </p>
        <p className="text-xs text-zinc-500">Como posso ajudar?</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className="text-xs px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:border-neon-500/30 hover:bg-neon-500/5 transition-colors cursor-pointer"
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
      // Small delay to allow panel animation
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

    // 1. Add user message
    addMessage({ role: 'user', content: text });
    setInputValue('');
    setLoading(true);

    try {
      // 2. Lazy import auth store to avoid circular deps
      const { useAuthStore } = await import('@/stores/auth-store');
      const token = useAuthStore.getState().token;

      // 3. Call API
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

      // 4. Add assistant response
      const assistantContent = data?.data?.content || data?.content || data?.message || 'Sem resposta disponível.';
      addMessage({ role: 'assistant', content: assistantContent });
    } catch {
      // 5. On error: system message
      addMessage({
        role: 'system',
        content: 'Erro de conexão. Tente novamente.',
      });
    } finally {
      // 6. Set loading false
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
            'rounded-xl border border-white/[0.06] bg-[#0c0c0f]',
            'backdrop-blur-xl shadow-2xl shadow-black/50',
            'flex flex-col overflow-hidden',
            'animate-in slide-in-from-bottom-4 fade-in-0 duration-200',
          )}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Bot className="h-5 w-5 text-zinc-300" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-neon-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-100 leading-tight">
                  XPayments AI
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Assistente Virtual
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] rounded-md"
              aria-label="Fechar chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* ── Messages Area ── */}
          <div ref={scrollRef} className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {showWelcome ? (
                <WelcomeState onSuggestionClick={handleSuggestionClick} />
              ) : (
                <div className="flex flex-col gap-2 py-4">
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
          <div className="shrink-0 border-t border-white/[0.06] p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunta sobre a XPayments..."
                disabled={isLoading}
                className={cn(
                  'flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl',
                  'px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600',
                  'outline-none focus:border-neon-500/40 focus:ring-1 focus:ring-neon-500/20',
                  'transition-colors disabled:opacity-50',
                )}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className={cn(
                  'h-10 w-10 shrink-0 rounded-xl',
                  'bg-neon-500 hover:bg-neon-600 text-black',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'transition-colors',
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
          'fixed bottom-6 right-6 z-50',
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-neon-500 text-black shadow-lg',
          'hover:bg-neon-600 active:scale-95',
          'transition-all duration-200',
          'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          // Pulse animation only when chat is closed
          !isOpen && 'animate-[pulse_3s_ease-in-out_infinite]',
        )}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
      </button>
    </>
  );
}