import mongoose, { Schema } from "mongoose";

/**
 * TODO: Evaluate the best approach for user location handling:
 * - Option 1: Store user's state in the user model for quick weather lookups
 * - Option 2: Determine user location dynamically on each request
 * Decide based on performance, accuracy, and user experience trade-offs.
 */

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, 
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      lga: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
