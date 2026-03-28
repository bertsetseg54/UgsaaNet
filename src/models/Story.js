import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  content: { type: String, required: true },
  images: { type: [String], default: [] }, // Олон зураг хадгалах Array
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Story || mongoose.model("Story", StorySchema);
