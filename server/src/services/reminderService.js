const pool = require("../db/pool");

const EDITABLE = ["kind", "title", "due_at", "done"];

async function ownsApplication(userId, applicationId) {
  const { rowCount } = await pool.query(
    "SELECT 1 FROM applications WHERE id = $1 AND user_id = $2",
    [applicationId, userId],
  );
  return rowCount > 0;
}

// Returns null when the application doesn't exist or isn't yours.
async function create(userId, applicationId, data) {
  if (!(await ownsApplication(userId, applicationId))) return null;

  const { rows } = await pool.query(
    `INSERT INTO reminders (application_id, kind, title, due_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [applicationId, data.kind, data.title, data.due_at],
  );
  return rows[0];
}

async function list(userId, { upcoming, applicationId }) {
  const params = [userId];
  let sql = `SELECT r.*, a.company, a.position
             FROM reminders r
             JOIN applications a ON a.id = r.application_id
             WHERE a.user_id = $1`;

  if (applicationId) {
    params.push(applicationId);
    sql += ` AND r.application_id = $${params.length}`;
  }
  if (upcoming) sql += " AND r.done = false";
  sql += " ORDER BY r.due_at ASC";

  const { rows } = await pool.query(sql, params);
  return rows;
}

async function update(userId, id, data) {
  // Column names come from our EDITABLE list, never from the request.
  const fields = EDITABLE.filter((f) => data[f] !== undefined);
  const sets = fields.map((f, i) => `${f} = $${i + 3}`);
  const values = fields.map((f) => data[f]);

  const { rows } = await pool.query(
    `UPDATE reminders
     SET ${sets.join(", ")}
     FROM applications
     WHERE reminders.id = $1
       AND reminders.application_id = applications.id
       AND applications.user_id = $2
     RETURNING reminders.*`,
    [id, userId, ...values],
  );
  return rows[0];
}

async function remove(userId, id) {
  const { rowCount } = await pool.query(
    `DELETE FROM reminders
     USING applications
     WHERE reminders.id = $1
       AND reminders.application_id = applications.id
       AND applications.user_id = $2`,
    [id, userId],
  );
  return rowCount > 0;
}

module.exports = { EDITABLE, create, list, update, remove };
