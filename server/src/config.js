const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

module.exports = config;
