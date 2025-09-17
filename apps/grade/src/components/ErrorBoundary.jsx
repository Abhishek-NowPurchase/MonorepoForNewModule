import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    // console.error('🚨 Error Boundary Caught Error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary-fallback bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
          </div>
          
          <div className="text-red-700 mb-4">
            <p className="mb-2">The grade module encountered an error and couldn't load properly.</p>
            <p className="text-sm">This might be due to:</p>
            <ul className="list-disc list-inside text-sm mt-1 ml-4">
              <li>Missing or corrupted data</li>
              <li>Network connectivity issues</li>
              <li>Browser compatibility problems</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-red-600 hover:text-red-800">
                Show Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-red-800 font-mono text-xs overflow-auto">
                <div><strong>Error:</strong> {this.state.error.toString()}</div>
                <div className="mt-2"><strong>Stack:</strong></div>
                <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
