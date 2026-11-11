import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import StatusBadge from "./StatusBadge";

const dateOnly = (value) =>
  new Date(value).toLocaleDateString("en-PH", { dateStyle: "medium" });

export default function ApplicationsTable({ applications, onChanged }) {
  const [transitions, setTransitions] = useState({});
  const [confirmId, setConfirmId] = useState(null); // row waiting for delete confirmation
  const [busyId, setBusyId] = useState(null); // row with a request in progress
  const [error, setError] = useState("");

  // The allowed moves come from the API, which reads them from the shared package.
  useEffect(() => {
    api("/statuses")
      .then((data) => setTransitions(data.transitions))
      .catch((err) => setError(err.message));
  }, []);

  async function run(id, request) {
    setError("");
    setBusyId(id);
    try {
      await request();
      await onChanged(); // reload the table and the dashboard numbers
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  const changeStatus = (id, status) =>
    run(id, () =>
      api(`/applications/${id}/status`, { method: "PATCH", body: { status } }),
    );

  const remove = (id) =>
    run(id, () => api(`/applications/${id}`, { method: "DELETE" }));

  if (applications.length === 0) {
    return <p className="text-sm text-slate-500">No applications yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-2">
                Company
              </th>
              <th scope="col" className="px-4 py-2">
                Position
              </th>
              <th scope="col" className="px-4 py-2">
                Status
              </th>
              <th scope="col" className="px-4 py-2">
                Move to
              </th>
              <th scope="col" className="px-4 py-2">
                Added
              </th>
              <th scope="col" className="px-4 py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {applications.map((app) => {
              const moves = transitions[app.status] || [];
              return (
                <tr
                  key={app.id}
                  className={busyId === app.id ? "opacity-50" : ""}
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/applications/${app.id}`}
                      className="text-emerald-700 hover:underline"
                    >
                      {app.company}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{app.position}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3">
                    {moves.length > 0 ? (
                      <select
                        aria-label={`Change status of ${app.company}`}
                        value=""
                        disabled={busyId === app.id}
                        onChange={(e) => changeStatus(app.id, e.target.value)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                      >
                        <option value="" disabled>
                          Move to...
                        </option>
                        {moves.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">Final</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {dateOnly(app.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmId === app.id ? (
                      <span className="inline-flex gap-2">
                        <button
                          onClick={() => remove(app.id)}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                        >
                          Keep
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(app.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
