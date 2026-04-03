import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  familyId: { type: String, required: true }, // Ургийн ID
}, { timestamps: true });

export default mongoose.models.Story || mongoose.model('Story', StorySchema);