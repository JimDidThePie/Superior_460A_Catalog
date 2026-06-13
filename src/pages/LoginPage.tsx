import { Lock } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { loginAdmin } from "../lib/authService";

export function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (loginAdmin(password)) {
      window.location.href = "/admin";
      return;
    }

    setError("Incorrect password.");
  };

  return (
    <main className="login-shell">
      <form className="login-panel" onSubmit={handleSubmit}>
        <span>
          <Lock aria-hidden="true" />
        </span>
        <h1>Admin Login</h1>
        <label>
          Password
          <input
            autoFocus
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">Log In</button>
        <a href="/display">Back to display</a>
      </form>
    </main>
  );
}
