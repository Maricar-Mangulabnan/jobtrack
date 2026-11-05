const pool = require("../db/pool");

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

module.exports = { create, list, getById };
