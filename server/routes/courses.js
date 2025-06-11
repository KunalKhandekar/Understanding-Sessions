import express from "express";
import { sessions } from "../app.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const { sessionID } = req.cookies;
    const courses = await Course.find();

    if (!sessionID) {
      const guestSession = new mongoose.Types.ObjectId();
      sessions.push({ _id: guestSession, cart: [] });
      return res
        .cookie("sessionID", guestSession, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(courses);
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
