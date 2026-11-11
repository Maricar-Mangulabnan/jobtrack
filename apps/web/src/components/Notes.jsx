import { useEffect, useState } from "react";
import { api } from "../api";

const when = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function Notes({ applicationId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  async function load() {
    try {
      const data = await api(`/applications/${applicationId}/notes`);
      setNotes(data.notes);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function addNote(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // The API field is called "body".
      await api(`/applications/${applicationId}/notes`, {
        method: "POST",
        body: { body: text },
      });
      setText("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeNote(id) {
    setError("");
    try {
      await api(`/notes/${id}`, { method: "DELETE" });
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section aria-labelledby="notes" className="space-y-3">
      <h2 id="notes" className="text-lg font-semibold">
        Notes
      </h2>

      <form onSubmit={addNote} className="space-y-2">
        <label htmlFor="note" className="sr-only">
          New note
        </label>
        <textarea
          id="note"
          rows={3}
          maxLength={5000}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Recruiter name, interview questions, impressions..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add note"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {notes.length === 0 ? (
        <p className="text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
          {notes.map((note) => (
            <li key={note.id} className="space-y-1 px-4 py-3">
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{when(note.created_at)}</span>
                {confirmId === note.id ? (
                  <span className="inline-flex gap-2">
                    <button
                      onClick={() => removeNote(note.id)}
                      className="rounded-md bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(note.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
