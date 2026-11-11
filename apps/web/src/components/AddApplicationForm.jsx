import { useState } from "react";
import { api } from "../api";

const EMPTY = {
  company: "",
  position: "",
  job_url: "",
  location: "",
  work_setup: "",
  salary_min: "",
  salary_max: "",
  currency: "PHP",
};

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function AddApplicationForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Send only the fields that have a value. Salary fields become numbers.
    const body = {};
    for (const [key, value] of Object.entries(form)) {
      if (value === "") continue;
      body[key] = key.startsWith("salary") ? Number(value) : value;
    }

    try {
      await api("/applications", { method: "POST", body });
      setForm(EMPTY);
      onCreated();
    } catch (err) {
      setError(err.message); // the API's own message, e.g. salary range errors
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid gap-4 rounded-lg bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="company" className="block text-sm font-medium">
          Company
        </label>
        <input
          id="company"
          required
          value={form.company}
          onChange={set("company")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium">
          Position
        </label>
        <input
          id="position"
          required
          value={form.position}
          onChange={set("position")}
          className={fieldClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="job_url" className="block text-sm font-medium">
          Job link
        </label>
        <input
          id="job_url"
          type="url"
          value={form.job_url}
          onChange={set("job_url")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium">
          Location
        </label>
        <input
          id="location"
          value={form.location}
          onChange={set("location")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="work_setup" className="block text-sm font-medium">
          Work setup
        </label>
        <select
          id="work_setup"
          value={form.work_setup}
          onChange={set("work_setup")}
          className={fieldClass}
        >
          <option value="">Not specified</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:col-span-2">
        <div>
          <label htmlFor="salary_min" className="block text-sm font-medium">
            Salary from
          </label>
          <input
            id="salary_min"
            type="number"
            min="0"
            value={form.salary_min}
            onChange={set("salary_min")}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="salary_max" className="block text-sm font-medium">
            Salary to
          </label>
          <input
            id="salary_max"
            type="number"
            min="0"
            value={form.salary_max}
            onChange={set("salary_max")}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium">
            Currency
          </label>
          <select
            id="currency"
            value={form.currency}
            onChange={set("currency")}
            className={fieldClass}
          >
            <option value="PHP">PHP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save application"}
        </button>
      </div>
    </form>
  );
}
