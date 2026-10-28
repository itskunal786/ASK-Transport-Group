import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            background: 'var(--bg-surface, #1e293b)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            margin: '16px 0',
            color: 'var(--text-primary, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f87171' }}>
              {this.props.fallbackTitle || 'Component Error Encountered'}
            </h3>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this module.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ↻ Retry / Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
