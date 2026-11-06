const pool = require("../db/pool");

async function ownsApplication(userId, applicationId) {
  const { rowCount } = await pool.query(
    "SELECT 1 FROM applications WHERE id = $1 AND user_id = $2",
    [applicationId, userId],
  );
  return rowCount > 0;
}

// Returns null when the application doesn't exist or isn't yours.
async function list(userId, applicationId) {
  if (!(await ownsApplication(userId, applicationId))) return null;

  const { rows } = await pool.query(
    "SELECT * FROM notes WHERE application_id = $1 ORDER BY created_at DESC",
    [applicationId],
  );
  return rows;
}

async function create(userId, applicationId, body) {
  if (!(await ownsApplication(userId, applicationId))) return null;

  const { rows } = await pool.query(
    "INSERT INTO notes (application_id, body) VALUES ($1, $2) RETURNING *",
    [applicationId, body],
  );
  return rows[0];
}

async function remove(userId, noteId) {
  // USING joins notes to applications so we can check the owner in the same query.
  const { rowCount } = await pool.query(
    `DELETE FROM notes
     USING applications
     WHERE notes.id = $1
       AND notes.application_id = applications.id
       AND applications.user_id = $2`,
    [noteId, userId],
  );
  return rowCount > 0;
}

module.exports = { list, create, remove };
