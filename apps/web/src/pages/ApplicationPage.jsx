import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";
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

export default function ApplicationPage({ onLogout }) {
  const { id } = useParams(); // the :id from the URL
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        <Link to="/" className="text-sm text-emerald-700 hover:underline">
          ← Back to dashboard
        </Link>

        {loading && <p className="text-slate-500">Loading...</p>}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {application && (
          <>
            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{application.company}</h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-slate-600">{application.position}</p>

              {application.job_url && (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm text-emerald-700 hover:underline"
                >
                  Open job posting
                </a>
              )}

              {details.length > 0 && (
                <dl className="grid grid-cols-1 gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-2">
                  {details.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        {label}
                      </dt>
                      <dd className="text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            <Notes applicationId={application.id} />
          </>
        )}
      </main>
    </div>
  );
}
