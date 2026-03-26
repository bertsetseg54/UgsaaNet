import dbConnect from "@/lib/dbConnect";
import Story from "@/models/Story";

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  // 1. УСТГАХ (DELETE)
  if (req.method === "DELETE") {
    try {
      const deletedStory = await Story.findByIdAndDelete(id);
      if (!deletedStory)
        return res.status(404).json({ error: "Түүх олдсонгүй" });
      return res.status(200).json({ message: "Амжилттай устлаа" });
    } catch (e) {
      return res.status(500).json({ error: "Устгах үед алдаа гарлаа" });
    }
  }

  // 2. ЗАСАХ (PUT)
  else if (req.method === "PUT") {
    try {
      const updatedStory = await Story.findByIdAndUpdate(id, req.body, {
        new: true, // Шинэчлэгдсэн датаг буцаах
        runValidators: true,
      });
      if (!updatedStory)
        return res.status(404).json({ error: "Түүх олдсонгүй" });
      return res.status(200).json(updatedStory);
    } catch (e) {
      return res.status(400).json({ error: "Шинэчлэхэд алдаа гарлаа" });
    }
  }

  // 3. ГАНЦААРЧИЛЖ ҮЗЭХ (GET)
  else if (req.method === "GET") {
    try {
      const story = await Story.findById(id);
      if (!story) return res.status(404).json({ error: "Түүх олдсонгүй" });
      return res.status(200).json(story);
    } catch (e) {
      return res.status(500).json({ error: "Серверийн алдаа" });
    }
  }
}
