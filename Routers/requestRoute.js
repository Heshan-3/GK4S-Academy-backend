import express from "express"
import { createAccessRequest, getTutorPendingRequests, handleRequestStatus } from "../Controllers/requestController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const requestRouter = express.Router();

requestRouter.post("/request-access",authMiddleware, createAccessRequest);
requestRouter.get("/pending-requests", authMiddleware, getTutorPendingRequests);
requestRouter.put("/approve/:requestId", authMiddleware, handleRequestStatus);

export default requestRouter;