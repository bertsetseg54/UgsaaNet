import dbConnect from "@/lib/dbConnect";
import Story from "@/models/Story";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { familyId } = req.query;
      if (!familyId) {
        return res.status(401).json({ error: "Нэвтрэлт хэрэгтэй" });
      }
      const stories = await Story.find({ familyId }).sort({ date: -1 });
      res.status(200).json(stories);
    } catch (e) {
      res.status(500).json({ error: "Дата авахад алдаа гарлаа" });
    }
  } else if (req.method === "POST") {
    try {
      const { familyId } = req.body;
      if (!familyId) {
        return res.status(401).json({ error: "Нэвтрэлт хэрэгтэй" });
      }
      const story = await Story.create(req.body);
      res.status(201).json(story);
    } catch (e) {
      res.status(400).json({ error: "Хадгалахад алдаа гарлаа" });
    }
  }
}
