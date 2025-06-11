import express from "express";
import mongoose from "mongoose";
import { sessions } from "../app.js";

const router = express.Router();

// Middleware
const checkSession = async (req, res, next) => {
  const { sessionID } = req.cookies;
  if (!sessionID) return res.json({ message: "Session ID not received" });
  const objectId = new mongoose.Types.ObjectId(sessionID);
  req.userSession = sessions.find((s) => s._id.equals(objectId));
  next();
};

// GET cart
router.get("/", checkSession, async (req, res) => {
  const userSession = req.userSession;
  return res.status(200).json(userSession.cart);
});

// Add to cart
router.post("/", checkSession, async (req, res) => {
  const { cart } = req.body;
  const userSession = req.userSession;
  userSession.cart = cart;
  res.status(201).json({ message: "Added to cart" });
});

// Remove course from cart
router.delete("/:name", checkSession, async (req, res) => {
  const { name } = req.params;
  const userSession = req.userSession;
  userSession.cart = userSession.cart.filter((item) => item.name !== name);
  return res.status(200).json({ message: "Deleted the Item" });
});

// Clear cart
router.delete("/", async (req, res) => {
  //Add your code here
});

export default router;
