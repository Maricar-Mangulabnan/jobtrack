import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";

export default function Board({ onLogout }) {
  const [apps, setApps] = useState([]);
  const [rules, setRules] = useState(null); // { statuses, transitions }
  const [dragging, setDragging] = useState(null); // { id, from }
  const [overColumn, setOverColumn] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/statuses"), api("/applications")])
      .then(([r, a]) => {
        setRules(r);
        setApps(a.applications);
      })
      .catch((err) => {
        if (err.status === 401) onLogout();
        else setError(err.message);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Can the card being dragged be dropped into this column?
  const canDrop = (to) =>
    dragging &&
    dragging.from !== to &&
    rules.transitions[dragging.from]?.includes(to);

  async function move(id, to) {
    const before = apps;
    setError("");
    setApps(apps.map((a) => (a.id === id ? { ...a, status: to } : a))); // optimistic
    try {
      await api(`/applications/${id}/status`, {
        method: "PATCH",
        body: { status: to },
      });
    } catch (err) {
      setApps(before); // roll back
      setError(err.message);
    }
  }

  function handleDrop(e, to) {
    e.preventDefault();
    setOverColumn(null);
    if (canDrop(to)) move(dragging.id, to);
    setDragging(null);
  }

  if (loading) return <p className="p-6 text-slate-500">Loading...</p>;

  return (
    <main className="mx-auto max-w-[110rem] space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Board</h1>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {rules && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {rules.statuses.map((status) => {
            const cards = apps.filter((a) => a.status === status);
            const droppable = canDrop(status);
            return (
              <section
                key={status}
                onDragOver={(e) => {
                  if (droppable) {
                    e.preventDefault(); // this is what allows a drop here
                    setOverColumn(status);
                  }
                }}
                onDragLeave={() => setOverColumn(null)}
                onDrop={(e) => handleDrop(e, status)}
                className={`w-64 shrink-0 rounded-lg p-2 ring-1 transition ${
                  overColumn === status
                    ? "bg-emerald-100 ring-emerald-500"
                    : droppable
                      ? "bg-emerald-50 ring-emerald-300"
                      : dragging
                        ? "bg-slate-100 opacity-50 ring-slate-200"
                        : "bg-slate-100 ring-slate-200"
                }`}
              >
                <h2 className="mb-2 flex items-center justify-between px-1 text-sm font-semibold">
                  {status}
                  <span className="text-xs font-normal text-slate-500">
                    {cards.length}
                  </span>
                </h2>

                <div className="min-h-16 space-y-2">
                  {cards.map((app) => (
                    <article
                      key={app.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        setDragging({ id: app.id, from: app.status });
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setOverColumn(null);
                      }}
                      className={`cursor-grab rounded-md bg-white p-3 shadow-sm ring-1 ring-slate-200 active:cursor-grabbing ${
                        dragging?.id === app.id ? "opacity-40" : ""
                      }`}
                    >
                      <Link
                        to={`/applications/${app.id}`}
                        className="block text-sm font-medium hover:underline"
                      >
                        {app.company}
                      </Link>
                      <p className="text-xs text-slate-600">{app.position}</p>
                      <div className="mt-2">
                        <StatusBadge status={app.status} />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
