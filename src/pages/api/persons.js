import cloudinary from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("family");
  const collection = db.collection("persons");

  try {
    // --- GET: МЭДЭЭЛЭЛ АВАХ ---
    if (req.method === "GET") {
      const persons = await collection.find({}).toArray();
      const formatted = persons.map((p) => {
        const parent = p.parentId
          ? persons.find((pr) => pr._id.toString() === p.parentId.toString())
          : null;
        return {
          ...p,
          _id: p._id.toString(),
          pic: p.imageUrl || p.pic || "",
          parentName: parent
            ? parent.name
            : Number(p.generation) === 1
            ? "Ургийн Тэргүүн"
            : "Тодорхойгүй",
        };
      });
      return res.status(200).json({ success: true, data: formatted });
    }

    // --- POST: ШИНЭЭР БҮРТГЭХ ---
    if (req.method === "POST") {
      const { pic, ...data } = req.body;
      let imageUrl = data.imageUrl || "";

      if (pic && pic.startsWith("data:image")) {
        const uploadRes = await cloudinary.uploader.upload(pic, {
          folder: "family-tree",
        });
        imageUrl = uploadRes.secure_url;
      }

      const newPerson = {
        ...data,
        generation: Number(data.generation) || 1,
        imageUrl,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(newPerson);
      return res.status(201).json({
        success: true,
        data: { _id: result.insertedId, ...newPerson },
      });
    }

    // --- PUT: МЭДЭЭЛЭЛ ЗАСАХ ---
    if (req.method === "PUT") {
      const { _id, updateData } = req.body;
      const { pic, ...fields } = updateData;
      let finalImageUrl = fields.imageUrl || "";

      if (pic && pic.startsWith("data:image")) {
        const uploadRes = await cloudinary.uploader.upload(pic, {
          folder: "family-tree",
        });
        finalImageUrl = uploadRes.secure_url;
      }

      // _id-г дата дотроос хасах (Mongo-д _id засаж болохгүй)
      delete fields._id;

      await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: { ...fields, imageUrl: finalImageUrl, updatedAt: new Date() } }
      );
      return res.status(200).json({ success: true });
    }

    // --- DELETE: УСТГАХ ---
    if (req.method === "DELETE") {
      // Body-оос ирж буй өгөгдлийг шалгах
      const id = req.body._id || req.body.id || req.query.id;

      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "ID дамжуулаагүй байна" });
      }

      try {
        // 1. Зургийг Cloudinary-аас устгах хэсгийг түр алгасаад баазаас устгаж үзэцгээе
        const result = await collection.deleteOne({
          _id: new ObjectId(id.toString()),
        });

        if (result.deletedCount === 1) {
          return res.status(200).json({ success: true });
        } else {
          // Хэрэв энд орж байвал ID нь баазад байгаа ID-тай таарахгүй байна гэсэн үг
          console.log("Олдоогүй ID:", id);
          return res.status(404).json({
            success: false,
            message: "Бааз дээр ийм ID-тай хүн олдсонгүй",
          });
        }
      } catch (err) {
        console.error("Delete Error:", err);
        return res
          .status(400)
          .json({ success: false, message: "ID-ийн формат буруу байна" });
      }
    }

    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  } catch (e) {
    console.error("API Error:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
}
