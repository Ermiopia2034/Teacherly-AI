'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    // This is a simple reset. For more complex cases, you might want to
    // navigate the user away or reload the page.
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid #ff000030', borderRadius: '8px', margin: '1rem' }}>
          <h2 style={{ color: '#ff4d4d' }}>Something went wrong.</h2>
          <p>We&amp;apos;ve logged the error and will look into it.</p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;