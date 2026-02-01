import { addContent, deleteContent, getContents, getFeaturedContents, getPublicContents, updateContent } from "../Controllers/contentController.js";
import express from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/upload.js";
import Content from "../Models/content.js";
import Request from "../Models/request.js";


const contentRouter = express.Router();

contentRouter.post("/add", authMiddleware, addContent);
contentRouter.get("/all", authMiddleware, async (req, res) => {
  try {
    console.log("Student ID from Auth:", req.user?.id); // DEBUG 1

    // 1. Fetch contents
    const contents = await Content.find().populate('tutor', 'firstName lastName');
    console.log("Contents found:", contents.length); // DEBUG 2

    // 2. Fetch requests for this student
    // Ensure you use 'student' as the field name, matching your Model
    const studentRequests = await Request.find({ student: req.user.id });
    console.log("Requests found for student:", studentRequests.length); // DEBUG 3

    // 3. Merge
    const mappedData = contents.map(course => {
      const userRequest = studentRequests.find(
        (r) => r.content.toString() === course._id.toString()
      );

      return {
        ...course.toObject(),
        accessStatus: userRequest ? userRequest.status : 'none'
      };
    });

    res.json(mappedData);
  } catch (err) {
    console.error("SERVER ERROR AT /all:", err); // This will show the real error in your terminal
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});
contentRouter.delete("/delete/:id", authMiddleware, deleteContent);
contentRouter.put("/update/:id", authMiddleware, updateContent);
contentRouter.get("/featured", getFeaturedContents);
contentRouter.get("/public", getPublicContents);

export default contentRouter;