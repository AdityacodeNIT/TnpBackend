import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
  path: "./.env"
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("err", error);
      throw error;
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is listening at port http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB CONNECTION FAILED ", err);
  });
