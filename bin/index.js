import express from "express";

import render from "../helper/html-render.js";

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || "http://localhost";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST" // , PUT, PATCH, DELETE
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, X-Requested-With, Accept"
  );
  next();
});

app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(express.json(), express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  const homePage = await render("./views/home.html", {
    resourcePath: `${host}:${port}`,
    redirectUrl: "/",
    app: { name: "String-Encryption" },
    isAuthenticated: false,
    isNotShowSignin: true,
  });
  res.status(200).send(homePage);
});

app.use(
  (req, res, next) => {
    res.status(404).json({
      message: "Endpoint not found",
    });
  },
  (error, req, res, next) => {
    res.status(error.statusCode || 500).json({
      message: error.message,
      data: error.data,
    });
  }
);

app.listen(port);
