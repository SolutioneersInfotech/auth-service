import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const router = express.Router();
// Signup
router.post("/signup", async (req, res) => {
    const { email, password, projectId } = req.body;
    if (!email || !password || !projectId) {
        return res.status(400).json({ message: "All fields required" });
    }
    const existing = await User.findOne({ email, projectId });
    if (existing)
        return res.status(400).json({ message: "User exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, projectId });
    await user.save();
    res.json({ message: "Signup successful" });
});
// Login
router.post("/login", async (req, res) => {
    const { email, password, projectId } = req.body;
    const user = await User.findOne({ email, projectId });
    if (!user)
        return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id, projectId: user.projectId }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
});
// Verify
router.get("/me", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json(decoded);
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
});
export default router;
