const { STATUSES } = require("@jobtrack/shared");
const service = require("../services/applicationService");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SETUPS = ["onsite", "hybrid", "remote"];

function validate(body) {
  if (typeof body.company !== "string" || !body.company.trim())
    return "Company is required";
  if (typeof body.position !== "string" || !body.position.trim())
    return "Position is required";
  if (body.work_setup != null && !SETUPS.includes(body.work_setup)) {
    return "work_setup must be onsite, hybrid or remote";
  }
  for (const key of ["salary_min", "salary_max"]) {
    if (body[key] != null && (!Number.isInteger(body[key]) || body[key] < 0)) {
      return `${key} must be a whole number, 0 or more`;
    }
  }
  if (
    body.salary_min != null &&
    body.salary_max != null &&
    body.salary_max < body.salary_min
  ) {
    return "salary_max must be at least salary_min";
  }
  if (body.currency != null && !/^[A-Za-z]{3}$/.test(body.currency)) {
    return "currency must be a 3-letter code like PHP";
  }
  return null;
}

async function create(req, res, next) {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const application = await service.create(req.userId, {
      ...req.body,
      company: req.body.company.trim(),
      position: req.body.position.trim(),
    });
    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, q } = req.query;
    if (status && !STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }
    const applications = await service.list(req.userId, { status, q });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id))
      return res.status(404).json({ error: "Application not found" });

    const application = await service.getById(req.userId, id);
    if (!application)
      return res.status(404).json({ error: "Application not found" });
    res.json({ application });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne };
