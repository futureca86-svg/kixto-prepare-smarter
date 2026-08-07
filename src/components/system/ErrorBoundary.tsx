import { Component, type ErrorInfo, type ReactNode } from "react";
import { logAppError } from "@/lib/system/error-log";
import { ErrorScreen } from "./ErrorScreen";

type Props = {
  children: ReactNode;
  /** Module or widget name, used in logs and the recovery panel. */
  name?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  /** Custom fallback; receives a reset function. */
  fallback?: (args: { error: unknown; reset: () => void }) => ReactNode;
  onReset?: () => void;
};

type State = { error: unknown | null; key: number };

/**
 * Reusable boundary. Wrap the app once (global) and every module/widget.
 * A crash inside one boundary never takes down anything outside it.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, key: 0 };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    void logAppError(error, {
      module: this.props.name ?? "app",
      component: this.props.name ?? "ErrorBoundary",
      metadata: { componentStack: info.componentStack?.slice(0, 2000) },
    });
  }

  reset = () => {
    this.props.onReset?.();
    this.setState((s) => ({ error: null, key: s.key + 1 }));
  };

  override render() {
    const { error, key } = this.state;
    if (error !== null) {
      if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
      return (
        <ErrorScreen
          error={error}
          onRetry={this.reset}
          onReload={() => window.location.reload()}
          {...(this.props.compact !== undefined ? { compact: this.props.compact } : {})}
          {...(this.props.name ? { moduleName: this.props.name } : {})}
          {...(this.props.title ? { title: this.props.title } : {})}
          {...(this.props.description ? { description: this.props.description } : {})}
        />
      );
    }
    return <div key={key} className="contents">{this.props.children}</div>;
  }
}

/** Convenience wrapper for a whole module/page area. */
export function ModuleBoundary({ name, children }: { name: string; children: ReactNode }) {
  return <ErrorBoundary name={name}>{children}</ErrorBoundary>;
}