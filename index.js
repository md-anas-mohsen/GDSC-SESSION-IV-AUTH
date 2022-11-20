const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const users = require("./routes/user");

mongoose.connect("mongodb://localhost:27017/GDSC-SESSION-IV").then((conn) => {
  console.log(`MongoDB connected with HOST: ${conn.connection.host}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/users", users);

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running on PORT " + PORT);
});
