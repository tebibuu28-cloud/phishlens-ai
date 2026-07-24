import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("PhishLens ErrorBoundary caught an exception:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected UI rendering error occurred. PhishLens caught this safely without leaking data.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            variant="outline"
            size="sm"
            className="border-border/60 text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Application State
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
