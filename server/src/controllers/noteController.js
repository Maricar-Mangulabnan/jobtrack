const service = require("../services/noteService");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LENGTH = 5000;

function notFound(res, what) {
  return res.status(404).json({ error: `${what} not found` });
}

async function list(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res, "Application");

    const notes = await service.list(req.userId, id);
    if (!notes) return notFound(res, "Application");
    res.json({ notes });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res, "Application");

    // The JSON field is called "body", so req.body.body is correct here.
    const text = typeof req.body.body === "string" ? req.body.body.trim() : "";
    if (!text) return res.status(400).json({ error: "Note text is required" });
    if (text.length > MAX_LENGTH) {
      return res
        .status(400)
        .json({ error: `Note must be ${MAX_LENGTH} characters or fewer` });
    }

    const note = await service.create(req.userId, id, text);
    if (!note) return notFound(res, "Application");
    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID.test(id)) return notFound(res, "Note");

    const deleted = await service.remove(req.userId, id);
    if (!deleted) return notFound(res, "Note");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
