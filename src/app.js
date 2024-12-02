import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse JSON and URL encoded data
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

// Static files
app.use(express.static("public")); // Serve static files

app.use(cookieParser());

// Routes import
import userrouter from "./routes/user.routes.js";
import carRouter from "./routes/cars.routes.js";
import newsrouter from "./routes/news.routes.js";

// Routes declaration
app.use("/api/v1/users", userrouter);
app.use("/api/v1/cars", carRouter);
app.use("/news", newsrouter);

export { app };
