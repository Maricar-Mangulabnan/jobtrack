const pool = require("../db/pool");
const { canMove } = require("@jobtrack/shared");

// Only these columns can be changed through the edit endpoint.
// Status is NOT here: it changes through changeStatus() so the rules are enforced.
const EDITABLE = [
  "company",
  "position",
  "job_url",
  "location",
  "work_setup",
  "salary_min",
  "salary_max",
  "currency",
  "description",
];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function create(userId, data) {
  // One statement: insert the application AND its first status_history row.
  const { rows } = await pool.query(
    `WITH new_app AS (
       INSERT INTO applications
         (user_id, company, position, job_url, location, work_setup,
          salary_min, salary_max, currency, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *
     ),
     hist AS (
       INSERT INTO status_history (application_id, from_status, to_status)
       SELECT id, NULL, status FROM new_app
     )
     SELECT * FROM new_app`,
    [
      userId,
      data.company,
      data.position,
      data.job_url || null,
      data.location || null,
      data.work_setup || null,
      data.salary_min ?? null,
      data.salary_max ?? null,
      data.currency ? data.currency.toUpperCase() : null,
      data.description || null,
    ],
  );
  return rows[0];
}

async function list(userId, { status, q }) {
  const params = [userId];
  let sql = "SELECT * FROM applications WHERE user_id = $1";

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }
  if (q) {
    params.push(`%${q}%`);
    sql += ` AND (company ILIKE $${params.length} OR position ILIKE $${params.length})`;
  }

  sql += " ORDER BY updated_at DESC";
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getById(userId, id) {
  const { rows } = await pool.query(
    "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return rows[0];
}

async function update(userId, id, data) {
  // Column names come from our own EDITABLE list, never from the request,
  // so building the SQL text this way is safe. Values still use $ placeholders.
  const fields = EDITABLE.filter((f) => data[f] !== undefined);
  const sets = fields.map((f, i) => `${f} = $${i + 3}`);
  const values = fields.map((f) =>
    f === "currency" && data[f] ? data[f].toUpperCase() : data[f],
  );

  try {
    const { rows } = await pool.query(
      `UPDATE applications SET ${sets.join(", ")}
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, ...values],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23514") throw httpError(400, "Salary range is invalid");
    throw err;
  }
}

async function changeStatus(userId, id, nextStatus) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // FOR UPDATE locks the row so two requests can't change it at the same time
    const { rows } = await client.query(
      "SELECT status FROM applications WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, userId],
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    const current = rows[0].status;
    if (!canMove(current, nextStatus)) {
      throw httpError(409, `Cannot move from ${current} to ${nextStatus}`);
    }

    const { rows: updated } = await client.query(
      `UPDATE applications
          SET status = $3::application_status,
              applied_on = CASE
                WHEN $3::application_status = 'Applied' AND applied_on IS NULL
                THEN CURRENT_DATE ELSE applied_on END
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
      [id, userId, nextStatus],
    );

    await client.query(
      "INSERT INTO status_history (application_id, from_status, to_status) VALUES ($1, $2, $3)",
      [id, current, nextStatus],
    );

    await client.query("COMMIT");
    return updated[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function remove(userId, id) {
  const { rowCount } = await pool.query(
    "DELETE FROM applications WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return rowCount > 0;
}

// Oldest first, so it reads like a timeline. Empty means the application
// doesn't exist or isn't yours (every real application has a first row).
async function history(userId, id) {
  const { rows } = await pool.query(
    `SELECT h.id, h.from_status, h.to_status, h.changed_at
     FROM status_history h
     JOIN applications a ON a.id = h.application_id
     WHERE h.application_id = $1 AND a.user_id = $2
     ORDER BY h.changed_at ASC, h.id ASC`,
    [id, userId],
  );
  return rows.length > 0 ? rows : null;
}

module.exports = {
  EDITABLE,
  create,
  list,
  getById,
  update,
  changeStatus,
  remove,
  history,
};
