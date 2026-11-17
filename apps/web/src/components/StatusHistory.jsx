import { useEffect, useState } from "react";
import { api } from "../api";
import StatusBadge from "./StatusBadge";

const when = (value) =>
  new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function StatusHistory({ applicationId }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/applications/${applicationId}/history`)
      .then((data) => setRows(data.history))
      .catch((err) => setError(err.message));
  }, [applicationId]);

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">History</h2>
      {error && <p className="text-sm font-semibold">{error}</p>}

      <ol className="ml-2 space-y-4 border-l border-line pl-6">
        {rows.map((row) => (
          <li key={row.id} className="relative">
            <span className="absolute -left-[1.95rem] top-1 h-3.5 w-3.5 rounded-full border border-line bg-sky" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {row.from_status ? (
                <>
                  <StatusBadge status={row.from_status} />
                  <span className="font-bold">→</span>
                  <StatusBadge status={row.to_status} />
                </>
              ) : (
                <>
                  <span className="font-medium text-ink-soft">Added as</span>
                  <StatusBadge status={row.to_status} />
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-soft">{when(row.changed_at)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
