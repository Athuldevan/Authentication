const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/authRouter');

const db = `mongodb+srv://athul:RuoKzhNM6tyfDgB2@studentmanagment.kk52gdz.mongodb.net/StudentManagment?retryWrites=true&w=majority&appName=StudentManagment`;
//

const host = "localhost";
const PORT = 7000;

mongoose
  .connect(db)
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.log("❌ Database connection error:", err));
const app = express();
app.use(express.json());
app.use(cookieParser());

// ROUES
app.use("/auth",authRouter)

app.listen(PORT, host, () => {
  console.log(`✅ App is running on http://${host}:${PORT}`);
});
