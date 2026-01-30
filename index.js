import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRouter from "./Routers/userRouter.js";
import contentRouter from "./Routers/contentRoute.js";
import materialRouter from "./Routers/materialRoute.js";
import reviewRouter from "./Routers/reviewRoute.js";
import messageRouter from "./Routers/messageRoute.js";
import complaintRouter from "./Routers/complaintRoute.js";

dotenv.config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

/* ---------- MONGODB ---------- */
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connection established successfully ✅");
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
    process.exit(1);
  });

/* ---------- ROUTES ---------- */
app.use("/api/users", userRouter);
app.use("/api/contents", contentRouter);
app.use("/api/materials", materialRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/messages", messageRouter);
app.use("/api/complaints", complaintRouter);

/* ---------- SERVER ---------- */
app.listen(3000, () => {
  console.log("Server is running on port 3000 🚀");
});
