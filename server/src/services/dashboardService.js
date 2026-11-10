const pool = require("../db/pool");
const { STATUSES } = require("@jobtrack/shared");

async function summary(userId) {
  // Three independent queries, so run them at the same time.
  const [counts, upcoming, overdue] = await Promise.all([
    pool.query(
      `SELECT status, count(*)::int AS n
       FROM applications
       WHERE user_id = $1
       GROUP BY status`,
      [userId],
    ),
    pool.query(
      `SELECT r.*, a.company, a.position
       FROM reminders r
       JOIN applications a ON a.id = r.application_id
       WHERE a.user_id = $1 AND r.done = false AND r.due_at >= now()
       ORDER BY r.due_at ASC
       LIMIT 5`,
      [userId],
    ),
    pool.query(
      `SELECT count(*)::int AS n
       FROM reminders r
       JOIN applications a ON a.id = r.application_id
       WHERE a.user_id = $1 AND r.done = false AND r.due_at < now()`,
      [userId],
    ),
  ]);

  // Start every status at 0 so the client always gets all 7 keys.
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  counts.rows.forEach((row) => {
    byStatus[row.status] = row.n;
  });
  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);

  return {
    counts: byStatus,
    total,
    upcoming: upcoming.rows,
    overdue_count: overdue.rows[0].n,
  };
}

module.exports = { summary };
