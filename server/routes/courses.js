import express from "express";
import Course from "../models/Course.js";
import Session from "../models/Session.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const { sessionID } = req.signedCookies;
    const courses = await Course.find();

    if (!sessionID) {
      const guestSession = await Session.create({});
      res.cookie("sessionID", guestSession._id, {
        httpOnly: true,
        signed: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
