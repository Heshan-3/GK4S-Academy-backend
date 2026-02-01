import { addContent, deleteContent, getContents, getFeaturedContents, getPublicContents, updateContent } from "../Controllers/contentController.js";
import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/upload.js";


const contentRouter = express.Router();

contentRouter.post("/add", authMiddleware, addContent);
contentRouter.get("/all", authMiddleware, getContents);
contentRouter.delete("/delete/:id", authMiddleware, deleteContent);
contentRouter.put("/update/:id", authMiddleware, updateContent);
contentRouter.get("/featured", getFeaturedContents);
contentRouter.get("/public", getPublicContents);

export default contentRouter;