const authService = require("../services/authService");

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!isEmail(email))
      return res.status(400).json({ error: "A valid email is required" });
    if (typeof password !== "string" || password.length < 10) {
      return res
        .status(400)
        .json({ error: "Password must be at least 10 characters" });
    }
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const result = await authService.register({
      email,
      password,
      name: name.trim(),
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getUser(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
