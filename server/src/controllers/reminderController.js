const { UUID } = require("../utils/validation");
const service = require("../services/reminderService");

const KINDS = ["follow_up", "interview", "assessment", "deadline"];

function notFound(res, what) {
  return res.status(404).json({ error: `${what} not found` });
}

// Returns an ISO string for a valid date, or null.
function parseDate(value) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// partial = true is for edits: only the fields that are sent get checked.
function validate(body, { partial = false } = {}) {
  if (!partial || body.kind !== undefined) {
    if (!KINDS.includes(body.kind))
      return `kind must be one of: ${KINDS.join(", ")}`;
  }
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim())
      return "Title is required";
    if (body.title.trim().length > 200)
      return "Title must be 200 characters or fewer";
  }
  if (!partial || body.due_at !== undefined) {
    if (!parseDate(body.due_at)) {
      return "due_at must be a valid date, like 2026-11-20T14:00:00+08:00";
    }
  }
  if (body.done !== undefined && typeof body.done !== "boolean") {
    return "done must be true or false";
  }
  return null;
}

async function create(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res, "Application");

    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const reminder = await service.create(req.userId, id, {
      kind: req.body.kind,
      title: req.body.title.trim(),
      due_at: parseDate(req.body.due_at),
    });
    if (!reminder) return notFound(res, "Application");
    res.status(201).json({ reminder });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const upcoming = req.query.upcoming === "true";
    const applicationId = req.query.application_id;
    if (applicationId && !UUID.test(applicationId)) {
      return res
        .status(400)
        .json({ error: "application_id must be a valid id" });
    }

    const reminders = await service.list(req.userId, {
      upcoming,
      applicationId,
    });
    res.json({ reminders });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res, "Reminder");

    if (!service.EDITABLE.some((f) => req.body[f] !== undefined)) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    const error = validate(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const data = {};
    if (req.body.kind !== undefined) data.kind = req.body.kind;
    if (req.body.title !== undefined) data.title = req.body.title.trim();
    if (req.body.due_at !== undefined) data.due_at = parseDate(req.body.due_at);
    if (req.body.done !== undefined) data.done = req.body.done;

    const reminder = await service.update(req.userId, id, data);
    if (!reminder) return notFound(res, "Reminder");
    res.json({ reminder });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res, "Reminder");

    const deleted = await service.remove(req.userId, id);
    if (!deleted) return notFound(res, "Reminder");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, update, remove };
