const service = require("../services/dashboardService");

async function summary(req, res, next) {
  try {
    const result = await service.summary(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };
