-- 001_init.sql: first schema for JobTrack

CREATE TYPE application_status AS ENUM (
  'Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'
);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE applications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company     text NOT NULL,
  position    text NOT NULL,
  job_url     text,
  location    text,
  work_setup  text CHECK (work_setup IN ('onsite', 'hybrid', 'remote')),
  salary_min  integer CHECK (salary_min >= 0),
  salary_max  integer CHECK (salary_max >= 0),
  currency    char(3),
  status      application_status NOT NULL DEFAULT 'Saved',
  applied_on  date,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
);

CREATE INDEX idx_applications_user_status ON applications (user_id, status);

CREATE TABLE status_history (
  id             bigserial PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status    application_status,
  to_status      application_status NOT NULL,
  changed_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_application ON status_history (application_id, changed_at);

CREATE TABLE notes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  body           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_application ON notes (application_id, created_at DESC);

CREATE TABLE reminders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  kind           text NOT NULL CHECK (kind IN ('follow_up', 'interview', 'assessment', 'deadline')),
  title          text NOT NULL,
  due_at         timestamptz NOT NULL,
  done           boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_reminders_due ON reminders (due_at) WHERE done = false;

-- keep applications.updated_at fresh on every update
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_set_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();