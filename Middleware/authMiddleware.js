import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import dotenv from "dotenv";

dotenv.config();

export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization token missing" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        // Find user by ID from token
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        req.user = user; // attach user to request
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
}