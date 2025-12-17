"use client";

import { Component, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ScannerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's the removeChild error we want to suppress
    if (error.message?.includes("removeChild") || 
        error.message?.includes("not a child")) {
      // Suppress this specific error
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Only log if it's not the removeChild error
    if (!error.message?.includes("removeChild") && 
        !error.message?.includes("not a child")) {
      console.error("Scanner error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Scanner error: {this.state.error.message}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

