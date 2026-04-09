// pages/api/upload.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Зургийн дээд хэмжээг 10MB болгож өсгөв
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body; // Frontend-ээс ирэх Base64 текст

    if (!image) {
      return res.status(400).json({ error: "Зураг олдсонгүй" });
    }

    // Vercel дээр файл бичих боломжгүй тул текстийг шууд буцаана.
    // Энэ текст (Base64) нь таны MongoDB-д хадгалагдах болно.
    return res.status(200).json({ url: image });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}