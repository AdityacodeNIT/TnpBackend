import dotenv from "dotenv";
import connectDB from "./db/index.js";

// Load environment variables from .env file
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.error("error", (error) => {
      console.log("err", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening at port :${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB CONNECTION FAILED ", err);
  });
// Database connection function
