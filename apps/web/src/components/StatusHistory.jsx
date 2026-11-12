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
      <h2 className="mb-3 text-lg font-semibold">History</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
        {rows.map((row) => (
          <li key={row.id} className="relative">
            <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {row.from_status ? (
                <>
                  <StatusBadge status={row.from_status} />
                  <span className="text-slate-400">→</span>
                  <StatusBadge status={row.to_status} />
                </>
              ) : (
                <>
                  <span className="text-slate-600">Added as</span>
                  <StatusBadge status={row.to_status} />
                </>
              )}
            </div>
            <p className="text-xs text-slate-500">{when(row.changed_at)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
