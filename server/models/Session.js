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
    expiry: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7),
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
