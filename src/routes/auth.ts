import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

const router = express.Router();

// Signup
router.post("/signup", async (req: Request, res: Response) => {
	const { email, password, projectId } = req.body;

	if (!email || !password || !projectId) {
		return res.status(400).json({ message: "All fields required" });
	}

	const existing = await User.findOne({ email, projectId });
	if (existing) return res.status(400).json({ message: "User exists" });

	const hashed = await bcrypt.hash(password, 10);
	const user: IUser = new User({ email, password: hashed, projectId });
	const savedUser = await user.save();
  if (!savedUser) return res.status(500).json({ message: "Error saving user" });

  const token = jwt.sign({ userId: user._id, email: user.email, projectId: user.projectId }, process.env.JWT_SECRET!, { expiresIn: "1d" });

  if (!token) return res.status(500).json({ message: "Error generating token" });
	res.json({ message: "Signup successful", user: savedUser, token });
});

// Login
router.post("/login", async (req: Request, res: Response) => {
	const { email, password, projectId } = req.body;
  if (!email || !password || !projectId) {
    return res.status(400).json({ message: "All fields required" });
  }
	const user = await User.findOne({ email, projectId });
	if (!user) return res.status(400).json({ message: "User does not exist" });

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

	const token = jwt.sign({ userId: user._id, email: user.email, projectId: user.projectId }, process.env.JWT_SECRET!, { expiresIn: "1d" });

	res.json({ token, user: { id: user._id, email: user.email, projectId: user.projectId } });
});

// Verify
router.get("/me", (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) return res.status(401).json({ message: "No token" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		res.json(decoded);
	} catch {
		res.status(401).json({ message: "Invalid token" });
	}
});

export default router;
