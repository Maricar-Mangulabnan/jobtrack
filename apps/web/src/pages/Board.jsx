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

  if (loading) return <p className="p-6 text-ink-soft">Loading...</p>;

  return (
    <main className="mx-auto max-w-[110rem] space-y-6 px-4 py-8">
      <h1 className="text-3xl font-extrabold">Board</h1>

      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {rules && (
        <div className="flex gap-4 overflow-x-auto p-1 pb-6">
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
                className={`w-64 shrink-0 rounded-2xl border-2 p-3 transition ${
                  overColumn === status
                    ? "border-ink bg-mist"
                    : droppable
                      ? "border-dashed border-ink bg-mist/40"
                      : dragging
                        ? "border-line bg-card/40 opacity-50"
                        : "border-line bg-card/60"
                }`}
              >
                <h2 className="mb-3 flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="rounded-full border-2 border-ink bg-card px-2 text-xs font-bold">
                    {cards.length}
                  </span>
                </h2>

                <div className="min-h-16 space-y-3">
                  {cards.length === 0 && (
                    <p className="px-1 py-3 text-xs text-ink-soft">
                      No applications
                    </p>
                  )}
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
                      className={`card cursor-grab p-3 transition-all hover:-translate-y-0.5 hover:shadow-pop-lg active:cursor-grabbing ${
                        dragging?.id === app.id ? "opacity-40" : ""
                      }`}
                    >
                      <Link
                        to={`/applications/${app.id}`}
                        className="block font-semibold hover:underline"
                      >
                        {app.company}
                      </Link>
                      <p className="text-xs text-ink-soft">{app.position}</p>
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
