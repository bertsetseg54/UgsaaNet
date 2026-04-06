import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false }, // Файл дамжуулах тул bodyParser-ийг идэвхгүй болгоно
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => {
      // Файлын нэрийг давхцахгүй байх үүднээс хугацаа болон нэрийг нэгтгэнэ
      const cleanName = part.originalFilename.replace(/[^a-zA-Z0-9.]/g, "_");
      return `${Date.now()}-${cleanName}`;
    },
  });

  try {
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: "Файл олдсонгүй" });

    // Нийтэд хандах URL
    const publicUrl = `/uploads/${file.newFilename}`;

    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}