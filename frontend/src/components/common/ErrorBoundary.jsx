"use client";

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error Boundary Exception:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="error-boundary-fallback"
          className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white p-6 text-center"
        >
          <div className="max-w-md w-full bg-zinc-800 border border-zinc-700 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-rose-400 mb-3">Something went wrong</h2>
            <p className="text-zinc-400 text-sm mb-6">
              An unexpected error occurred while rendering this page. Our team has been notified.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
