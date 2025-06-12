import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { checkSession } from "../middleware/auth.js";
import Session from "../models/Session.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { sessionID } = req.signedCookies;
    let session = sessionID ? await Session.findById(sessionID) : null;

    if (!session) {
      session = await Session.create({ userId: user._id });
    } else {
      session.userId = user._id;
      session.expiry = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7); // 7 days
      await session.save();
    }

    const cartExist = await Cart.findOne({ userId: session.userId });

    if (cartExist) {
      const merged = [...cartExist.courses];

      for (const item of session.data.cart) {
        const existing = merged.find(
          (c) => c.courseId.toString() === item.courseId.toString()
        );
        if (existing) {
          existing.quantity += item.quantity || 1;
        } else {
          merged.push({ ...item, quantity: item.quantity || 1 });
        }
      }

      cartExist.courses = merged;
      await cartExist.save();
    } else {
      await Cart.create({
        userId: session.userId,
        courses: session.data.cart.map((item) => ({
          ...item,
          quantity: item.quantity || 1,
        })),
      });
    }

    session.data = {};
    await session.save();

    res.cookie("sessionID", session._id, {
      httpOnly: true,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/profile", checkSession, async (req, res) => {
  try {
    const session = await req.userSession.populate("userId");

    if (session.expiry < Date.now() / 1000) {
      res.clearCookie("sessionID");
      return res.status(402).json({ message: "Session Expired" });
    }

    if (req.userSession.userId) {
      return res.json({
        email: session?.userId?.email,
        name: session?.userId?.name,
      });
    }

    res.json(null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", async (req, res) => {
  const { sessionID } = req.signedCookies;
  await Session.deleteOne({ _id: sessionID });
  res.clearCookie("sessionID");
  return res.status(200).json({ message: "Logout Successful" });
});

export default router;
