import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const uploadDir = path.join(process.cwd(), "/public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    // formidable v3+ дээр filename функц нь ийм бүтэцтэй:
    filename: (name, ext, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  try {
    // Promise ашиглаж parse хийх
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // formidable v3 дээр files.file нь массив байдаг
    const file = data.files.file?.[0] || data.files.file;
    if (!file) {
      return res.status(400).json({ error: "Файл олдсонгүй" });
    }

    const fileName = path.basename(file.filepath);
    const safeFileName = encodeURIComponent(fileName);
    const publicUrl = `/uploads/${safeFileName}`;

    // Бусад өртөөг шалгана (файл бас байгаа эсэх)
    if (!fs.existsSync(file.filepath)) {
      return res.status(500).json({ error: "Файл сервер дээр хадгалагдсангүй" });
    }

    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
