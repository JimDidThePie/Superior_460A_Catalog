import { ErrorBoundary } from "./components/ErrorBoundary";
import { AdminPage } from "./pages/AdminPage";
import { DisplayPage } from "./pages/DisplayPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductPage } from "./pages/ProductPage";

export default function App() {
  const path = window.location.pathname;

  if (path.startsWith("/admin")) {
    return (
      <ErrorBoundary>
        <AdminPage />
      </ErrorBoundary>
    );
  }

  if (path.startsWith("/login")) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    );
  }

  if (path.startsWith("/product/")) {
    return (
      <ErrorBoundary>
        <ProductPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DisplayPage />
    </ErrorBoundary>
  );
}
