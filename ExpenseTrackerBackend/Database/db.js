const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST, // This will now correctly pull the full URL from your .env
    port: process.env.DB_PORT || 21386,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false, // Keeps the required secure Aiven connection active
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

sequelize
  .authenticate()
  .then(() => console.log("MySQL Cloud Connected successfully!"))
  .catch((err) => console.log("DB Error:", err));

module.exports = sequelize;
