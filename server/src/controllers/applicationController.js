const { STATUSES } = require("@jobtrack/shared");
const service = require("../services/applicationService");
const { UUID } = require("../utils/validation");
const SETUPS = ["onsite", "hybrid", "remote"];

function notFound(res) {
  return res.status(404).json({ error: "Application not found" });
}

// partial = true is for edits: only the fields that are sent get checked.
function validate(body, { partial = false } = {}) {
  for (const key of ["company", "position"]) {
    const value = body[key];
    if (partial && value === undefined) continue;
    if (typeof value !== "string" || !value.trim()) {
      return `${key === "company" ? "Company" : "Position"} is required`;
    }
  }
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

function trimNames(body) {
  const data = { ...body };
  if (typeof data.company === "string") data.company = data.company.trim();
  if (typeof data.position === "string") data.position = data.position.trim();
  return data;
}

async function create(req, res, next) {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const application = await service.create(req.userId, trimNames(req.body));
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
    if (!UUID.test(id)) return notFound(res);

    const application = await service.getById(req.userId, id);
    if (!application) return notFound(res);
    res.json({ application });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res);

    if (!service.EDITABLE.some((f) => req.body[f] !== undefined)) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    const error = validate(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const application = await service.update(
      req.userId,
      id,
      trimNames(req.body),
    );
    if (!application) return notFound(res);
    res.json({ application });
  } catch (err) {
    next(err);
  }
}

async function changeStatus(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res);

    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${STATUSES.join(", ")}` });
    }

    const application = await service.changeStatus(req.userId, id, status);
    if (!application) return notFound(res);
    res.json({ application });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res);

    const deleted = await service.remove(req.userId, id);
    if (!deleted) return notFound(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res);

    const rows = await service.history(req.userId, id);
    if (!rows) return notFound(res);
    res.json({ history: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  changeStatus,
  remove,
  history,
};
