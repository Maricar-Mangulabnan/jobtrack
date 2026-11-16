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
    <section aria-labelledby="notes" className="space-y-4">
      <h2 id="notes" className="text-2xl font-extrabold">
        Notes
      </h2>

      <form onSubmit={addNote} className="space-y-3">
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
          className="field w-full"
        />
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Add note"}
        </button>
      </form>

      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-ink-soft">No notes yet.</p>
      ) : (
        <ul className="card divide-y-2 divide-line overflow-hidden">
          {notes.map((note) => (
            <li key={note.id} className="space-y-2 px-4 py-3">
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>{when(note.created_at)}</span>
                {confirmId === note.id ? (
                  <span className="inline-flex gap-2">
                    <button
                      onClick={() => removeNote(note.id)}
                      className="btn bg-pop py-0.5 text-xs"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="btn py-0.5 text-xs"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(note.id)}
                    className="font-semibold hover:text-ink hover:underline"
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
