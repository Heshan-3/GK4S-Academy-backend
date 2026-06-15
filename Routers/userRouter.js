import express from "express"
import { blockOrUnblockUser, deleteUser, getAdminStats, getAllUsers, getPublicTutors, getTutorStats, getTutorStudents, getUser, loginUser, registerUser } from "../Controllers/userController.js"
import { authMiddleware } from "../Middleware/authMiddleware.js"
import upload from "../Middleware/upload.js"
import uploadUser from "../Middleware/uploadImages.js"

const userRouter = express.Router()

userRouter.post("/", uploadUser.single("profileImage"),registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",authMiddleware, getUser)
userRouter.get("/all",authMiddleware, getAllUsers)
userRouter.get("/tutor-students", authMiddleware, getTutorStudents)
userRouter.get("/tutor-stats", authMiddleware, getTutorStats)
userRouter.get("/tutors", getPublicTutors)
userRouter.delete("/delete/:id", authMiddleware, deleteUser)
userRouter.get("/admin-stats", authMiddleware, getAdminStats)
userRouter.put("/block/:email", authMiddleware, blockOrUnblockUser)

export default userRouter