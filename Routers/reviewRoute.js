import express from "express";
import { addReview, deleteReview, getReviews, getReviewsByContent } from "../Controllers/reviewController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/all", authMiddleware, getReviews);
reviewRouter.delete("/delete/:id", authMiddleware, deleteReview);
reviewRouter.get("/content/:contentId", getReviewsByContent)

export default reviewRouter;