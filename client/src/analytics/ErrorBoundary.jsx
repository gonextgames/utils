'use client'
import React, { Component } from 'react'
import { sendError } from './sendError'

export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    generateCorrelationId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
      };
      

    async logErrorBoundary(error, errorInfo) {
        await sendError(error, "react_error_boundary", {
            application_layer: this.props.applicationLayer,
            componentStack: errorInfo?.componentStack,
            reactVersion: React.version,
            correlation_id: this.generateCorrelationId()
        });
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        this.logErrorBoundary(error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.props.isFallbackEnabled) {
            return (
                <div className="error-boundary-fallback">
                    <h2>Something went wrong</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.toString()}
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
