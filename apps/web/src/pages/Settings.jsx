import { useEffect, useState } from "react";
import { api } from "../api";
import ChangeEmailForm from "../components/ChangeEmailForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import Modal from "../components/Modal";

function NameForm({ user, onUserChange, onSaved, onCancel, onDirtyChange }) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The server trims the name, so compare the trimmed value.
  const unchanged = name.trim() === user.name;
  useEffect(() => {
    onDirtyChange(!unchanged);
  }, [unchanged, onDirtyChange]);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api("/auth/me", {
        method: "PATCH",
        body: { name },
      });
      onUserChange(data.user);
      onSaved(); // closes this form, so there is nothing left to reset
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold">
          Full name
        </label>
        <input
          id="name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field mt-1 w-full"
        />
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
          {saving ? "Saving..." : "Save name"}
        </button>
        <button type="button" onClick={onCancel} className="btn">
          Cancel
        </button>
      </div>
    </form>
  );
}

// One line: title, current value and an Edit button.
// The form itself opens in a modal (see Settings below).
function Row({ title, value, flash, onEdit }) {
  return (
    <section className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 truncate text-sm text-ink-soft">{value}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {flash && <span className="text-sm text-ink-soft">Saved ✓</span>}
        <button type="button" onClick={onEdit} className="btn py-1 text-sm">
          Edit
        </button>
      </div>
    </section>
  );
}

export default function Settings({ user, onUserChange, onLogout }) {
  const [editing, setEditing] = useState(null); // "name" | "email" | "password" | null
  const [flash, setFlash] = useState(null); // which row just saved
  const [dirty, setDirty] = useState(false); // the open form has unsaved input
  const [confirming, setConfirming] = useState(false); // "Discard changes?" is showing

  const open = (id) => {
    setFlash(null);
    setDirty(false);
    setEditing(id);
  };
  const close = () => {
    setEditing(null);
    setDirty(false);
    setConfirming(false);
  };
  const saved = (id) => {
    close();
    setFlash(id);
  };
  // Esc, the X and Cancel all come here. Ask first if something was typed.
  const tryClose = () => (dirty ? setConfirming(true) : close());
  // While the question is showing, Esc belongs to the question, not to this modal.
  const onModalClose = confirming ? () => {} : tryClose;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Manage how you sign in to JobTrack.
      </p>

      <div className="card mt-6 divide-y divide-line">
        <Row
          title="Name"
          value={user.name}
          flash={flash === "name"}
          onEdit={() => open("name")}
        />
        <Row
          title="Email"
          value={user.email}
          flash={flash === "email"}
          onEdit={() => open("email")}
        />
        <Row
          title="Password"
          value="••••••••••"
          flash={flash === "password"}
          onEdit={() => open("password")}
        />
      </div>

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

      {editing === "name" && (
        <Modal
          title="Change name"
          onClose={onModalClose}
          closeOnBackdrop={false}
        >
          <NameForm
            user={user}
            onUserChange={onUserChange}
            onSaved={() => saved("name")}
            onCancel={tryClose}
            onDirtyChange={setDirty}
          />
        </Modal>
      )}

      {editing === "email" && (
        <Modal
          title="Change email"
          onClose={onModalClose}
          closeOnBackdrop={false}
        >
          <ChangeEmailForm
            user={user}
            onUserChange={onUserChange}
            onSaved={() => saved("email")}
            onCancel={tryClose}
            onDirtyChange={setDirty}
          />
        </Modal>
      )}

      {editing === "password" && (
        <Modal
          title="Change password"
          onClose={onModalClose}
          closeOnBackdrop={false}
        >
          <ChangePasswordForm
            onSaved={() => saved("password")}
            onCancel={tryClose}
            onDirtyChange={setDirty}
          />
        </Modal>
      )}

      {confirming && (
        <Modal
          title="Discard changes?"
          onClose={() => setConfirming(false)}
          closeOnBackdrop={false}
          width="max-w-sm"
        >
          <p className="text-sm text-ink-soft">
            What you typed won't be saved.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              autoFocus
              onClick={() => setConfirming(false)}
              className="btn"
            >
              Keep editing
            </button>
            <button type="button" onClick={close} className="btn bg-pop">
              Discard
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
