const authService = require("../services/authService");

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
const PASSWORD_MIN = 10;

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!isEmail(email))
      return res.status(400).json({ error: "A valid email is required" });
    if (typeof password !== "string" || password.length < PASSWORD_MIN) {
      return res.status(400).json({
        error: `Password must be at least ${PASSWORD_MIN} characters`,
      });
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

async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const user = await authService.updateName(req.userId, name.trim());
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password: current, new_password: next_ } = req.body;
    if (typeof current !== "string" || !current) {
      return res.status(400).json({ error: "Current password is required" });
    }
    if (typeof next_ !== "string" || next_.length < PASSWORD_MIN) {
      return res.status(400).json({
        error: `New password must be at least ${PASSWORD_MIN} characters`,
      });
    }
    if (next_ === current) {
      return res
        .status(400)
        .json({ error: "New password must be different from the current one" });
    }
    await authService.changePassword(req.userId, current, next_);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function changeEmail(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!isEmail(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const user = await authService.changeEmail(req.userId, email, password);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  changeEmail,
};
