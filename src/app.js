import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS.ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "3mb" }));

//some  data is data is url encoded
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

app.use(express.static("public"));
// To serve the static files

app.use(cookieParser);

export { app };
// export default app
