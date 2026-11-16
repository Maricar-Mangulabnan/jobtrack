import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import StatusBadge from "./StatusBadge";

const dateOnly = (value) =>
  new Date(value).toLocaleDateString("en-PH", { dateStyle: "medium" });

export default function ApplicationsTable({
  applications,
  filtered,
  onChanged,
}) {
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
    return (
      <p className="text-sm text-ink-soft">
        {filtered
          ? "No applications match your filters."
          : "No applications yet."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-ink bg-mist/50 text-xs font-bold uppercase tracking-wide">
            <tr>
              <th scope="col" className="px-4 py-3">
                Company
              </th>
              <th scope="col" className="px-4 py-3">
                Position
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Move to
              </th>
              <th scope="col" className="px-4 py-3">
                Added
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-line">
            {applications.map((app) => {
              const moves = transitions[app.status] || [];
              return (
                <tr
                  key={app.id}
                  className={`hover:bg-paper ${
                    busyId === app.id ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">
                    <Link
                      to={`/applications/${app.id}`}
                      className="text-primary hover:underline"
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
                        className="field py-1 text-xs"
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
                      <span className="text-ink-soft">Final</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {dateOnly(app.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmId === app.id ? (
                      <span className="inline-flex gap-2">
                        <button
                          onClick={() => remove(app.id)}
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
                        onClick={() => setConfirmId(app.id)}
                        className="text-xs font-semibold text-ink-soft hover:text-ink hover:underline"
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
