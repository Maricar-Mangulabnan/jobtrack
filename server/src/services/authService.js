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

module.exports = { register, login };
