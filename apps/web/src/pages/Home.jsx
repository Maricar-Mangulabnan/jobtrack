import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";
import AddApplicationForm from "../components/AddApplicationForm";
import ApplicationsTable from "../components/ApplicationsTable";
import Filters from "../components/Filters";
const dateTime = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function Home({ onLogout }) {
  const [summary, setSummary] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ q: "", status: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // only the very first load
  const [showForm, setShowForm] = useState(false);
  const latestRequest = useRef(0);

  function handleError(err) {
    if (err.status === 401)
      onLogout(); // token expired
    else setError(err.message);
  }

  async function loadSummary() {
    try {
      setSummary(await api("/dashboard/summary"));
    } catch (err) {
      handleError(err);
    }
  }

  async function loadApplications() {
    const requestId = ++latestRequest.current;
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    const query = params.toString();

    try {
      const data = await api(`/applications${query ? `?${query}` : ""}`);
      // A newer search may have started while this one was loading. Ignore old answers.
      if (requestId === latestRequest.current) {
        setApplications(data.applications);
        setError("");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  // After add, status change or delete: refresh the numbers and the table.
  const load = () => Promise.all([loadSummary(), loadApplications()]);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggleStatus = (status) =>
    setFilters((current) => ({
      ...current,
      status: current.status === status ? "" : status,
    }));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
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
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  aria-pressed={filters.status === status}
                  className={`rounded-lg bg-white p-3 text-left ring-1 hover:ring-emerald-400 ${
                    filters.status === status
                      ? "ring-2 ring-emerald-600"
                      : "ring-slate-200"
                  }`}
                >
                  <span className="block text-2xl font-bold tabular-nums">
                    {count}
                  </span>
                  <span className="mt-1 block">
                    <StatusBadge status={status} />
                  </span>
                </button>
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

          <Filters
            statuses={summary ? Object.keys(summary.counts) : []}
            value={filters}
            onChange={(patch) =>
              setFilters((current) => ({ ...current, ...patch }))
            }
          />

          <ApplicationsTable
            applications={applications}
            filtered={Boolean(filters.q || filters.status)}
            onChanged={load}
          />
        </section>
      )}
    </main>
  );
}
