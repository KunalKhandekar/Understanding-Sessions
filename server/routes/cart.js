import express from "express";
import mongoose from "mongoose";
import Session from "../models/Session.js";
import { checkSession } from "../middleware/auth.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// GET: Fetch cart
router.get("/", checkSession, async (req, res) => {
  try {
    let cartCourses;
    if (req.userSession?.userId) {
      const cartDetails = await Cart.findOne({
        userId: req.userSession.userId,
      }).populate("courses.courseId");
      cartCourses = cartDetails.courses
        ?.map(({ courseId, quantity }) => {
          if (!courseId) return null;
          const { name, image, price, _id } = courseId;
          return { _id, quantity, name, image, price };
        })
        .filter(Boolean);
    } else {
      const populatedSession = await req.userSession.populate(
        "data.cart.courseId"
      );
      cartCourses = populatedSession.data.cart
        ?.map(({ courseId, quantity }) => {
          if (!courseId) return null;
          const { name, image, price, _id } = courseId;
          return { _id, quantity, name, image, price };
        })
        .filter(Boolean);
    }

    return res.status(200).json(cartCourses);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching cart", error });
  }
});

// POST: Add to cart
router.post("/", checkSession, async (req, res) => {
  const { courseId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    if (req.userSession?.userId) {
      const updatedCart = await Cart.findOneAndUpdate(
        { userId: req.userSession.userId, "courses.courseId": courseId },
        { $inc: { "courses.$.quantity": 1 } },
        { new: true }
      );

      if (!updatedCart) {
        await Cart.findOneAndUpdate(
          { userId: req.userSession.userId },
          {
            $push: { courses: { courseId, quantity: 1 } },
          }
        );
      }
    } else {
      const updatedCart = await Session.findOneAndUpdate(
        { _id: req.userSession._id, "data.cart.courseId": courseId },
        { $inc: { "data.cart.$.quantity": 1 } },
        { new: true }
      );

      if (!updatedCart) {
        await Session.findByIdAndUpdate(req.userSession._id, {
          $push: { "data.cart": { courseId, quantity: 1 } },
        });
      }
    }

    return res.status(201).json({ message: "Added to cart" });
  } catch (error) {
    return res.status(500).json({ message: "Error adding to cart", error });
  }
});

// DELETE: Remove course from cart
router.delete("/:courseId", checkSession, async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    if (req.userSession.userId) {
      await Cart.findOneAndUpdate(
        { userId: req.userSession.userId },
        {
          $pull: { courses: { courseId } },
        }
      );
    } else {
      await Session.findByIdAndUpdate(req.userSession._id, {
        $pull: { "data.cart": { courseId } },
      });
    }

    return res.status(200).json({ message: "Deleted the item" });
  } catch (error) {
    return res.status(500).json({ message: "Error removing item", error });
  }
});

export default router;
