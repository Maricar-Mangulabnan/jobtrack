const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const config = require("../config");

function signToken(user) {
  return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "7d" });
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function register({ email, password, name }) {
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), hash, name],
    );
    const user = rows[0];
    return { user, token: signToken(user) };
  } catch (err) {
    if (err.code === "23505") throw httpError(409, "Email already registered");
    throw err;
  }
}

async function login({ email, password }) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  const row = rows[0];
  const ok = row && (await bcrypt.compare(password, row.password_hash));
  if (!ok) throw httpError(401, "Invalid email or password");

  const user = {
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
  };
  return { user, token: signToken(user) };
}

async function getUser(id) {
  const { rows } = await pool.query(
    "SELECT id, email, name, created_at FROM users WHERE id = $1",
    [id],
  );
  return rows[0];
}

// Throws 400 when the password is wrong. Used before sensitive changes,
// so a stolen token alone is not enough to take over the account.
async function requirePassword(id, password) {
  const { rows } = await pool.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [id],
  );
  const row = rows[0];
  if (!row) throw httpError(404, "User not found");
  if (!(await bcrypt.compare(password, row.password_hash))) {
    throw httpError(400, "Current password is incorrect");
  }
}

async function updateName(id, name) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $2 WHERE id = $1
     RETURNING id, email, name, created_at`,
    [id, name],
  );
  return rows[0];
}

async function changePassword(id, currentPassword, newPassword) {
  await requirePassword(id, currentPassword);
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = $2 WHERE id = $1", [
    id,
    hash,
  ]);
}

async function changeEmail(id, email, password) {
  await requirePassword(id, password);
  try {
    const { rows } = await pool.query(
      `UPDATE users SET email = $2 WHERE id = $1
       RETURNING id, email, name, created_at`,
      [id, email.toLowerCase()],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw httpError(409, "Email already registered");
    throw err;
  }
}

module.exports = {
  register,
  login,
  getUser,
  updateName,
  changePassword,
  changeEmail,
};
