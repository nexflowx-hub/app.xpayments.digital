'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[XPayments.Digital] Page Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
            <AlertTriangle className="size-6 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200 mb-1">
            Erro ao carregar p&aacute;gina
          </h3>
          <p className="text-sm text-zinc-500 mb-4 max-w-sm">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-2 text-zinc-400 border-zinc-700 hover:text-zinc-200"
          >
            <RotateCcw className="size-3.5" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
