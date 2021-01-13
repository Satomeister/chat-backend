const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./core/db");
const passport = require("./core/passport");
const createSocket = require("./core/socket.io.js");
const createRoutes = require("./core/routes");

const app = express();
const { http, io } = createSocket(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

createRoutes(app, io);

http.listen(process.env.PORT | 3001, () => {
  console.log(`${process.env.PORT} running`);
});
