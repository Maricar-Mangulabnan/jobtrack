import { useState } from "react";
import { api } from "../api";

const PASSWORD_MIN = 10;

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Typing again hides the old "Saved" message.
  const edit = (setter) => (e) => {
    setter(e.target.value);
    setSaved(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);

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
      setCurrent("");
      setNext("");
      setConfirm("");
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
        <h2 className="font-semibold">Password</h2>
        <p className="text-sm text-ink-soft">
          Use at least {PASSWORD_MIN} characters.
        </p>
      </div>

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
          autoComplete="current-password"
          value={current}
          onChange={edit(setCurrent)}
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
            onChange={edit(setNext)}
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
            onChange={edit(setConfirm)}
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
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : "Change password"}
        </button>
        {saved && (
          <span className="text-sm text-ink-soft">Password updated ✓</span>
        )}
      </div>
    </form>
  );
}
