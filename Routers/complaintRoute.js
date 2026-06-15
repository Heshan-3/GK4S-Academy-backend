import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { addComplaint, deleteComplaint, getComplaints, updateComplaintStatus } from "../Controllers/complaintController.js";

const complaintRouter = express.Router();

complaintRouter.post("/add", authMiddleware, addComplaint);
complaintRouter.get("/get",authMiddleware, getComplaints);
complaintRouter.put("/update/:id", authMiddleware, updateComplaintStatus);
complaintRouter.delete("/delete/:id", authMiddleware, deleteComplaint);

export default complaintRouter;