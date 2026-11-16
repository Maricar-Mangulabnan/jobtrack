import { useState } from "react";

export const EMPTY = {
  company: "",
  position: "",
  job_url: "",
  location: "",
  work_setup: "",
  salary_min: "",
  salary_max: "",
  currency: "PHP",
  description: "",
};

const fieldClass = "field mt-1 w-full";
// Turns the form fields into the JSON the API expects.
// Adding: leave empty fields out. Editing: send null, so a field can be cleared.
function toBody(form, editing) {
  const body = {};
  for (const [key, value] of Object.entries(form)) {
    if (value === "") {
      if (editing) body[key] = null;
      continue;
    }
    body[key] = key.startsWith("salary") ? Number(value) : value;
  }
  // A currency without a salary means nothing.
  if (form.salary_min === "" && form.salary_max === "") {
    if (editing) body.currency = null;
    else delete body.currency;
  }
  return body;
}

export default function ApplicationForm({
  initial,
  editing = false,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(toBody(form, editing)); // the parent decides what happens next
    } catch (err) {
      setError(err.message); // the API's own message, e.g. salary range errors
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card grid gap-4 p-4 sm:grid-cols-2"
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

      <div className="sm:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={set("description")}
          placeholder="Paste the job description or requirements here"
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
