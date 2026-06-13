import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  clearDemoData = () => {
    localStorage.removeItem("showroom-products-v1");
    localStorage.removeItem("showroom-settings-v1");
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="error-boundary">
        <section>
          <p>Showroom display paused</p>
          <h1>Something in the saved catalog data could not render.</h1>
          <span>{this.state.error.message}</span>
          <div>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button type="button" onClick={this.clearDemoData}>
              Clear demo data
            </button>
          </div>
        </section>
      </main>
    );
  }
}
