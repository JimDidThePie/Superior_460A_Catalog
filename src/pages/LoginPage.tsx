import { Lock } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { loginAdmin } from "../lib/authService";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginAdmin(email, password);
      window.location.href = "/admin";
      return;
    } catch (loginError) {
      setError((loginError as Error).message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <form className="login-panel" onSubmit={handleSubmit}>
        <span>
          <Lock aria-hidden="true" />
        </span>
        <h1>Admin Login</h1>
        <label>
          Email
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter Supabase password"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log In"}</button>
        <a href="/display">Back to display</a>
      </form>
    </main>
  );
}
