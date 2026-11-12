import { useEffect, useState } from "react";

const fieldClass =
  "mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function Filters({ statuses, value, onChange }) {
  const [text, setText] = useState(value.q);

  // Wait until the user stops typing before asking the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim() !== value.q) onChange({ q: text.trim() });
    }, 300);
    return () => clearTimeout(timer); // typing again cancels the previous timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const active = Boolean(text || value.status);

  function clear() {
    setText("");
    onChange({ q: "", status: "" });
  }

  return (
    <div className="mb-3 flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label htmlFor="search" className="block text-sm font-medium">
          Search
        </label>
        <input
          id="search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Company or position"
          className={`${fieldClass} w-full`}
        />
      </div>

      <div>
        <label htmlFor="status-filter" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status-filter"
          value={value.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className={fieldClass}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {active && (
        <button
          type="button"
          onClick={clear}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        >
          Clear
        </button>
      )}
    </div>
  );
}
