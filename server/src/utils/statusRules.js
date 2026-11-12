const { STATUSES, TRANSITIONS } = require("@jobtrack/shared");

// A status with no moves left is a finished application (Rejected, Withdrawn).
const CLOSED = STATUSES.filter((s) => TRANSITIONS[s].length === 0);

module.exports = { CLOSED };
