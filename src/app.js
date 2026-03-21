import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();


const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

import newsrouter from "./routes/news.routes.js";

import eventrouter from "./routes/event.routes.js";


import sliderrouter from "./routes/slider.routes.js";

// Routes declaratio
app.get('/active', (req, res) => {
  res.status(200).send('Server is active');
});



app.use("/api/v1/users", userrouter);

app.use("/api/news", newsrouter);

app.use("/api/events", eventrouter);

app.use("/api/slider", sliderrouter);

export { app };
