import mongoose from "mongoose";

const PersonalInfoSchema = new mongoose.Schema({
  dateOfBirth: {
    type: Date,
  },
  position: {
    type: String,
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  profileImage: {
    type: String,
  },
  organization: {
    type: String,
    default: null,
  },
});

export default PersonalInfoSchema;
