// Single source of truth for statuses.
// Web, mobile and server all import from here.

const STATUSES = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

// status -> statuses it is allowed to move to
const TRANSITIONS = {
  Saved: ["Applied", "Withdrawn"],
  Applied: ["Assessment", "Interview", "Rejected", "Withdrawn"],
  Assessment: ["Interview", "Rejected", "Withdrawn"],
  Interview: ["Assessment", "Offer", "Rejected", "Withdrawn"],
  Offer: ["Withdrawn"],
  Rejected: [],
  Withdrawn: [],
};

function canMove(from, to) {
  return Boolean(TRANSITIONS[from] && TRANSITIONS[from].includes(to));
}

module.exports = { STATUSES, TRANSITIONS, canMove };
