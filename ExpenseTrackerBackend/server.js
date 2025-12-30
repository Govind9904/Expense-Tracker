require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const sequelize = require("./Database/db");

const { User, Category, Expense } = require("./Models/index");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Running....!");
});

const userRoutes = require("./Routes/userRoute");

app.use("/api", userRoutes);

sequelize
  .authenticate()
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

sequelize
  .sync({ alter: true }) // or { force: true } for drop & recreate
  .then(() => console.log("DB synced"))
  .catch((err) => console.log(err));

const ip = "127.0.0.1";
const port = 3000;

app.listen(port, ip, () =>
  console.log(`Server Running at: http://${ip}:${port}`)
);
