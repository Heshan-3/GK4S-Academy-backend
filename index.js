// index.js
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
import requestRouter from "./Routers/requestRoute.js";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });

const app = express();

/* ---------- MIDDLEWARE ---------- */

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",           // Development front-end
   // Replace with your production front-end
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests (like Postman)
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

/* ---------- MONGODB ---------- */

const mongoURL = process.env.MONGO_URL;

if (!mongoURL) {
  console.error("MONGO_URL is not defined in environment variables ❌");
  process.exit(1);
}

mongoose.connect(mongoURL)
  .then(() => console.log("MongoDB connection established successfully ✅"))
  .catch((error) => {
    console.error("MongoDB connection failed ❌", error.message);
    process.exit(1);
  });

/* ---------- ROUTES ---------- */
app.use("/api/users", userRouter);
app.use("/api/contents", contentRouter);
app.use("/api/materials", materialRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/messages", messageRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/requests", requestRouter);

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
