import { useState } from "react";
import { api } from "../api";

export default function ChangeEmailForm({ user, onUserChange }) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // The server lowercases emails, so compare the same way.
  const unchanged = email.trim().toLowerCase() === user.email;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const data = await api("/auth/email", {
        method: "PATCH",
        body: { email, password },
      });
      onUserChange(data.user);
      setEmail(data.user.email);
      setPassword("");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-4">
      <div>
        <h2 className="font-semibold">Email</h2>
        <p className="text-sm text-ink-soft">
          You'll use this address to log in.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
            className="field mt-1 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="email-password"
            className="block text-sm font-semibold"
          >
            Current password
          </label>
          <input
            id="email-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSaved(false);
            }}
            className="field mt-1 w-full"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || unchanged}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Change email"}
        </button>
        {saved && (
          <span className="text-sm text-ink-soft">Email updated ✓</span>
        )}
      </div>
    </form>
  );
}
