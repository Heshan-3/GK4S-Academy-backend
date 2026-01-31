import express from "express"
import { getAllUsers, getUser, loginUser, registerUser } from "../Controllers/userController.js"
import { authMiddleware } from "../Middleware/authMiddleware.js"

const userRouter = express.Router()

userRouter.post("/",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/me",authMiddleware, getUser)
userRouter.get("/all",authMiddleware, getAllUsers)

export default userRouter