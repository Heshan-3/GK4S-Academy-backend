import { deleteMessage, getMessages, markMessageRead, sendMessage } from "../Controllers/messageController.js";
import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const messageRouter = express.Router();

messageRouter.post("/send", authMiddleware, sendMessage);
messageRouter.get("/all", authMiddleware, getMessages);
messageRouter.delete("/delete/:id", authMiddleware, deleteMessage);
messageRouter.patch("/:id/read", authMiddleware, markMessageRead);

export default messageRouter;