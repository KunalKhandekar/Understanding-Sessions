import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    data: {
      cart: [
        {
          courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
          },
          quantity: {
            type: Number,
            default: 1,
          },
        },
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiry: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
      // expires: 0,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
