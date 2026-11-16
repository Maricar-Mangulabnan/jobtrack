import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";
import ApplicationForm from "../components/ApplicationForm";
import StatusHistory from "../components/StatusHistory";
import Reminders from "../components/Reminders";
import Notes from "../components/Notes";

const dateOnly = (value) =>
  new Date(value).toLocaleDateString("en-PH", { dateStyle: "medium" });

function salaryText(app) {
  const { salary_min: min, salary_max: max, currency } = app;
  if (min == null && max == null) return null;
  const fmt = (n) => n.toLocaleString("en-PH");
  const range =
    min != null && max != null ? `${fmt(min)} – ${fmt(max)}` : fmt(min ?? max);
  return `${currency || ""} ${range}`.trim();
}

// Fills the edit form with what is saved now. Empty database values become ''.
const toFormValues = (app) => ({
  company: app.company,
  position: app.position,
  job_url: app.job_url ?? "",
  location: app.location ?? "",
  work_setup: app.work_setup ?? "",
  salary_min: app.salary_min ?? "",
  salary_max: app.salary_max ?? "",
  currency: app.currency ?? "PHP",
  description: app.description ?? "",
});

export default function ApplicationPage({ onLogout }) {
  const { id } = useParams(); // the :id from the URL
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api(`/applications/${id}`)
      .then((data) => setApplication(data.application))
      .catch((err) => {
        if (err.status === 401) onLogout();
        else setError(err.message);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveChanges(body) {
    const data = await api(`/applications/${id}`, { method: "PATCH", body });
    setApplication(data.application);
    setEditing(false);
  }

  const details = application
    ? [
        ["Location", application.location],
        ["Work setup", application.work_setup],
        ["Salary", salaryText(application)],
        [
          "Applied on",
          application.applied_on && dateOnly(application.applied_on),
        ],
        ["Added", dateOnly(application.created_at)],
      ].filter(([, value]) => value)
    : [];

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
      <Link
        to="/"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Back to dashboard
      </Link>

      {loading && <p className="text-ink-soft">Loading...</p>}
      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      {application && (
        <>
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold">{application.company}</h1>
              <StatusBadge status={application.status} />
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn ml-auto"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <ApplicationForm
                editing
                initial={toFormValues(application)}
                submitLabel="Save changes"
                onSubmit={saveChanges}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                <p className="text-lg text-ink-soft">{application.position}</p>

                {application.job_url && (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    Open job posting ↗
                  </a>
                )}

                {details.length > 0 && (
                  <dl className="card grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                    {details.map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                          {label}
                        </dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {application.description && (
                  <div className="card p-4">
                    <h2 className="mb-1 font-sans text-xs font-bold uppercase tracking-wide text-ink-soft">
                      Description
                    </h2>
                    <p className="whitespace-pre-wrap text-sm">
                      {application.description}
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          <StatusHistory
            key={application.status}
            applicationId={application.id}
          />
          <Reminders applicationId={application.id} />
          <Notes applicationId={application.id} />
        </>
      )}
    </main>
  );
}
