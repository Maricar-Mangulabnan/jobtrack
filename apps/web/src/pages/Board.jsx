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
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold">Board</h1>

      {error && (
        <p className="rounded-xl border border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {rules && (
        // Small screens: scroll sideways. lg and up: seven equal columns that always fit.
        <div className="flex gap-3 overflow-x-auto p-1 pb-4 lg:grid lg:grid-cols-7 lg:overflow-visible">
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
                className={`w-56 shrink-0 rounded-2xl border p-2 transition lg:w-auto lg:min-w-0 ${
                  overColumn === status
                    ? "border-primary bg-mist"
                    : droppable
                      ? "border-dashed border-primary bg-mist/60"
                      : dragging
                        ? "border-line bg-card/40 opacity-50"
                        : "border-line bg-card/60"
                }`}
              >
                <h2 className="mb-2 flex items-center justify-between gap-1 px-1">
                  <StatusBadge status={status} />
                  <span className="rounded-full border border-line bg-card px-2 text-xs font-bold">
                    {cards.length}
                  </span>
                </h2>

                <div className="min-h-16 space-y-2">
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
                      className={`card relative cursor-pointer p-3 transition-shadow hover:border-primary hover:shadow-md ${
                        dragging?.id === app.id ? "opacity-40" : ""
                      }`}
                    >
                      {/* Stretched link: the ::after layer covers the whole card. */}
                      <Link
                        to={`/applications/${app.id}`}
                        draggable={false}
                        className="block after:absolute after:inset-0 after:content-['']"
                      >
                        <span className="block truncate text-sm font-semibold">
                          {app.company}
                        </span>
                      </Link>
                      <p className="truncate text-xs text-ink-soft">
                        {app.position}
                      </p>
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
