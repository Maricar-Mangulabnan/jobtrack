import { useState } from "react";
import { api } from "../api";

export default function ChangeEmailForm({
  user,
  onUserChange,
  onSaved,
  onCancel,
}) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The server lowercases emails, so compare the same way.
  const unchanged = email.trim().toLowerCase() === user.email;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api("/auth/email", {
        method: "PATCH",
        body: { email, password },
      });
      onUserChange(data.user);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-ink-soft">
        You'll use this address to log in. Confirm with your password.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-1 w-full"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || unchanged}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Change email"}
        </button>
        <button type="button" onClick={onCancel} className="btn">
          Cancel
        </button>
      </div>
    </form>
  );
}
