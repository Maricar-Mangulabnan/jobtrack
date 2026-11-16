import { useEffect, useState } from "react";

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
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label htmlFor="search" className="block text-sm font-semibold">
          Search
        </label>
        <input
          id="search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Company or position"
          className="field mt-1 w-full"
        />
      </div>

      <div>
        <label htmlFor="status-filter" className="block text-sm font-semibold">
          Status
        </label>
        <select
          id="status-filter"
          value={value.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="field mt-1"
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
        <button type="button" onClick={clear} className="btn py-2">
          Clear
        </button>
      )}
    </div>
  );
}
