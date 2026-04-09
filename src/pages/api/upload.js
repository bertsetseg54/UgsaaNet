// pages/api/upload.js
import formidable from "formidable";
import fs from "fs";
import path from "path";

// БОДИ БАРСЕР-ИЙГ ЗААВАЛ FALSE БОЛГОНО
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Хавтас бэлдэх
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 2. Formidable тохиргоо
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    filename: (name, ext, part) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Файлын нэрэн дэх хоосон зай болон тусгай тэмдэгтүүдийг цэвэрлэх
      const originalName = part.originalFilename || "image.png";
      const cleanName = originalName.replace(/[^a-zA-Z0-9.]/g, "_");
      return `${uniqueSuffix}-${cleanName}`;
    },
  });

  // 3. Файл хүлээн авах
  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable Parse Error:", err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    // Formidable-ийн хувилбараас хамаарч files.file нь массив эсвэл объект байна
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: "Файл илгээгдээгүй байна" });
    }

    // Шинэ нэрийг авах (V3 дээр newFilename, V2 дээр name эсвэл filepath-аас салгаж авна)
    const fileName = file.newFilename || path.basename(file.filepath || file.path);
    
    // Вэбээс хандах URL
    const publicUrl = `/uploads/${fileName}`;

    console.log("File uploaded successfully:", publicUrl);
    return res.status(200).json({ url: publicUrl });

  } catch (error) {
    console.error("Server Upload Error:", error);
    return res.status(500).json({ 
      error: "Upload failed", 
      details: error.message 
    });
  }
}