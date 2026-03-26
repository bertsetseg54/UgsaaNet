import dbConnect from "@/lib/dbConnect";
import Story from "@/models/Story";

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  if (req.method === "GET") {
    try {
      const story = await Story.findById(id);
      if (!story) return res.status(404).json({ error: "Түүх олдсонгүй" });
      res.status(200).json(story);
    } catch (e) {
      res.status(500).json({ error: "Серверийн алдаа" });
    }
  }
}