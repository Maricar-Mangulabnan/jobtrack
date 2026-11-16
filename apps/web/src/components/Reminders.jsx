import { useEffect, useState } from "react";
import { api } from "../api";

const KINDS = [
  ["follow_up", "Follow up"],
  ["interview", "Interview"],
  ["assessment", "Assessment"],
  ["deadline", "Deadline"],
];
const KIND_LABEL = Object.fromEntries(KINDS);

const when = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const fieldClass = "field mt-1 w-full";

export default function Reminders({ applicationId }) {
  const [reminders, setReminders] = useState([]);
  const [kind, setKind] = useState("follow_up");
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  async function load() {
    try {
      const data = await api(`/reminders?application_id=${applicationId}`);
      setReminders(data.reminders);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  async function addReminder(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api(`/applications/${applicationId}/reminders`, {
        method: "POST",
        // datetime-local gives local time with no zone; Date turns it into an exact moment.
        body: { kind, title, due_at: new Date(dueAt).toISOString() },
      });
      setTitle("");
      setDueAt("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(reminder) {
    setError("");
    try {
      await api(`/reminders/${reminder.id}`, {
        method: "PATCH",
        body: { done: !reminder.done },
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeReminder(id) {
    setError("");
    try {
      await api(`/reminders/${id}`, { method: "DELETE" });
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section aria-labelledby="reminders" className="space-y-4">
      <h2 id="reminders" className="text-2xl font-extrabold">
        Reminders
      </h2>

      <form
        onSubmit={addReminder}
        className="card grid gap-3 p-4 sm:grid-cols-3"
      >
        <div>
          <label htmlFor="kind" className="block text-sm font-semibold">
            Type
          </label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={fieldClass}
          >
            {KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="reminder-title"
            className="block text-sm font-semibold"
          >
            Title
          </label>
          <input
            id="reminder-title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="due" className="block text-sm font-semibold">
            Date and time
          </label>
          <input
            id="due"
            type="datetime-local"
            required
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : "Add reminder"}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {reminders.length === 0 ? (
        <p className="text-sm text-ink-soft">No reminders yet.</p>
      ) : (
        <ul className="card divide-y-2 divide-line overflow-hidden">
          {reminders.map((r) => {
            const overdue = !r.done && new Date(r.due_at) < new Date();
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={r.done}
                  onChange={() => toggleDone(r)}
                  aria-label={`Mark "${r.title}" as done`}
                  className="h-5 w-5 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold ${
                      r.done ? "text-ink-soft line-through" : ""
                    }`}
                  >
                    {r.title}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {KIND_LABEL[r.kind]} · {when(r.due_at)}
                    {overdue && (
                      <span className="ml-2 rounded-full border-2 border-ink bg-pop px-2 py-0.5 text-xs font-bold text-ink">
                        Overdue
                      </span>
                    )}
                  </p>
                </div>

                {confirmId === r.id ? (
                  <span className="inline-flex gap-2">
                    <button
                      onClick={() => removeReminder(r.id)}
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
                    onClick={() => setConfirmId(r.id)}
                    className="text-xs font-semibold text-ink-soft hover:text-ink hover:underline"
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
