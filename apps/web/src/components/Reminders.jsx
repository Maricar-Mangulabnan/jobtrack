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

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

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
    <section aria-labelledby="reminders" className="space-y-3">
      <h2 id="reminders" className="text-lg font-semibold">
        Reminders
      </h2>

      <form
        onSubmit={addReminder}
        className="grid gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-3"
      >
        <div>
          <label htmlFor="kind" className="block text-sm font-medium">
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
          <label htmlFor="reminder-title" className="block text-sm font-medium">
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
          <label htmlFor="due" className="block text-sm font-medium">
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
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add reminder"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {reminders.length === 0 ? (
        <p className="text-sm text-slate-500">No reminders yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
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
                  className="h-4 w-4 accent-emerald-700"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium ${r.done ? "text-slate-400 line-through" : ""}`}
                  >
                    {r.title}
                  </p>
                  <p
                    className={`text-sm ${overdue ? "text-red-600" : "text-slate-600"}`}
                  >
                    {KIND_LABEL[r.kind]} · {when(r.due_at)}
                    {overdue && " · Overdue"}
                  </p>
                </div>

                {confirmId === r.id ? (
                  <span className="inline-flex gap-2 text-xs">
                    <button
                      onClick={() => removeReminder(r.id)}
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
                    onClick={() => setConfirmId(r.id)}
                    className="text-xs text-red-600 hover:underline"
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
