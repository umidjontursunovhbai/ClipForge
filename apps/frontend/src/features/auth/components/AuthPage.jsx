import { Clapperboard, LockKeyhole, UserRound } from "lucide-react";
import React, { useState } from "react";

export function AuthPage({ error, isLoading, onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin12345");

  function submit(event) {
    event.preventDefault();
    onLogin({ username, password });
  }

  return (
    <main className="auth-shell">
      <form className="auth-panel" onSubmit={submit}>
        <div className="auth-logo">
          <Clapperboard size={26} aria-hidden="true" />
          <span>ClipForge</span>
        </div>

        <div className="auth-copy">
          <h1>Sign in</h1>
          <p>Template videos, transcription jobs, and generated outputs are tied to your account.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <label className="auth-field">
          <span>
            <UserRound size={16} aria-hidden="true" />
            Username
          </span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        </label>

        <label className="auth-field">
          <span>
            <LockKeyhole size={16} aria-hidden="true" />
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button className="primary-button full-width" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
