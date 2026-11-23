import { useState } from "react";
import { api } from "../api";

const PASSWORD_MIN = 10;

export default function ChangePasswordForm({ onSaved, onCancel }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Checked here so the user doesn't wait for a round trip.
    if (next !== confirm) {
      setError("New passwords don't match");
      return;
    }

    setSaving(true);
    try {
      await api("/auth/password", {
        method: "PATCH",
        body: { current_password: current, new_password: next },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-ink-soft">
        Use at least {PASSWORD_MIN} characters.
      </p>

      <div>
        <label
          htmlFor="current-password"
          className="block text-sm font-semibold"
        >
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="field mt-1 w-full"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new-password" className="block text-sm font-semibold">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={PASSWORD_MIN}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="field mt-1 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-semibold"
          >
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Change password"}
        </button>
        <button type="button" onClick={onCancel} className="btn">
          Cancel
        </button>
      </div>
    </form>
  );
}
