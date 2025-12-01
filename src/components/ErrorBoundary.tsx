import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  white: '#ffffff',
  muted: '#6b7280',
};

/**
 * Error Boundary global pour capturer les erreurs React
 * et afficher une UI de fallback au lieu d'un écran blanc
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log l'erreur (en production, envoyer à un service comme Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Intégrer avec un service de monitoring (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: { errorInfo } });
    // }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: colors.background }}
        >
          <div 
            className="max-w-md w-full p-8 rounded-2xl text-center"
            style={{ 
              backgroundColor: colors.white,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${colors.gold}20` }}
            >
              <AlertTriangle className="w-8 h-8" style={{ color: colors.gold }} />
            </div>
            
            <h1 
              className="text-xl font-semibold mb-2"
              style={{ color: colors.dark }}
            >
              Oups, quelque chose s'est mal passé
            </h1>
            
            <p 
              className="text-sm mb-6"
              style={{ color: colors.muted }}
            >
              Une erreur inattendue s'est produite. Nous nous excusons pour la gêne occasionnée.
            </p>

            {/* Afficher les détails en dev uniquement */}
            {import.meta.env.DEV && this.state.error && (
              <div 
                className="text-left p-4 rounded-lg mb-6 overflow-auto max-h-40"
                style={{ 
                  backgroundColor: colors.background,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                <p className="font-semibold text-red-600 mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs whitespace-pre-wrap" style={{ color: colors.muted }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.dark,
                }}
              >
                Retour à l'accueil
              </button>
              
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                style={{ 
                  backgroundColor: colors.gold,
                  color: colors.dark,
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
