import { useEffect, useState } from "react";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";
import AddApplicationForm from "../components/AddApplicationForm";
import ApplicationsTable from "../components/ApplicationsTable";

const dateTime = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function Home({ user, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Loads the dashboard numbers and the table. Called on open and after every change.
  async function load() {
    try {
      const [summaryData, appData] = await Promise.all([
        api("/dashboard/summary"),
        api("/applications"),
      ]);
      setSummary(summaryData);
      setApplications(appData.applications);
    } catch (err) {
      if (err.status === 401)
        onLogout(); // token expired
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-emerald-700">JobTrack</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user.name}</span>
            <button
              onClick={onLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading && <p className="text-slate-500">Loading...</p>}

        {summary && (
          <>
            <section aria-labelledby="overview">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="overview" className="text-lg font-semibold">
                  Overview
                </h2>
                <p className="text-sm text-slate-600">
                  {summary.total} applications
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {Object.entries(summary.counts).map(([status, count]) => (
                  <div
                    key={status}
                    className="rounded-lg bg-white p-3 ring-1 ring-slate-200"
                  >
                    <p className="text-2xl font-bold tabular-nums">{count}</p>
                    <div className="mt-1">
                      <StatusBadge status={status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="upcoming">
              <h2 id="upcoming" className="mb-3 text-lg font-semibold">
                Upcoming
              </h2>
              {summary.overdue_count > 0 && (
                <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {summary.overdue_count} overdue reminder
                  {summary.overdue_count > 1 ? "s" : ""}
                </p>
              )}
              {summary.upcoming.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing coming up.</p>
              ) : (
                <ul className="divide-y divide-slate-200 rounded-lg bg-white ring-1 ring-slate-200">
                  {summary.upcoming.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="text-sm text-slate-600">
                          {r.company} · {r.position}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">
                        {dateTime(r.due_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {!loading && (
          <section aria-labelledby="applications">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="applications" className="text-lg font-semibold">
                Applications
              </h2>
              <button
                onClick={() => setShowForm((open) => !open)}
                className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                {showForm ? "Cancel" : "Add application"}
              </button>
            </div>

            {showForm && (
              <AddApplicationForm
                onCreated={() => {
                  setShowForm(false);
                  load();
                }}
              />
            )}

            <ApplicationsTable applications={applications} onChanged={load} />
          </section>
        )}
      </main>
    </div>
  );
}
