import { useState } from "react";
import { api } from "../api";
import ChangePasswordForm from "../components/ChangePasswordForm";
import ChangeEmailForm from "../components/ChangeEmailForm";

export default function Settings({ user, onUserChange, onLogout }) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // The server trims the name, so compare the trimmed value.
  const unchanged = name.trim() === user.name;

  async function saveName(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const data = await api("/auth/me", {
        method: "PATCH",
        body: { name },
      });
      onUserChange(data.user);
      setName(data.user.name);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">Signed in as {user.email}</p>

      <form onSubmit={saveName} className="card mt-6 space-y-4 p-4">
        <div>
          <h2 className="font-semibold">Name</h2>
          <p className="text-sm text-ink-soft">
            This is the name shown in the header.
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold">
            Full name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="field mt-1 w-full"
          />
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
            {saving ? "Saving..." : "Save name"}
          </button>
          {saved && <span className="text-sm text-ink-soft">Saved ✓</span>}
        </div>
      </form>
      <ChangeEmailForm user={user} onUserChange={onUserChange} />
      <ChangePasswordForm />
      <section className="card mt-6 flex items-center justify-between gap-4 p-4">
        <div>
          <h2 className="font-semibold">Log out</h2>
          <p className="text-sm text-ink-soft">
            Sign out of JobTrack on this device.
          </p>
        </div>
        <button onClick={onLogout} className="btn">
          Log out
        </button>
      </section>
    </main>
  );
}
