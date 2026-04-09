import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Хүсэлтээс файлын нэрийг авах (query эсвэл header-ээс)
    const filename = req.query.filename || 'image.png';

    // 2. Vercel Blob руу шууд хуулах
    // Энэ нь Vercel-ийн үүлэн санд хадгалах бөгөөд Deploy дээр хэзээ ч алдаа заахгүй
    const blob = await put(filename, req, {
      access: 'public',
    });

    // 3. Хадгалагдсан URL-ийг буцаах
    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed", details: error.message });
  }
}

// Биеийн хэмжээг хязгаарлахгүй байх тохиргоо (заавал биш)
export const config = {
  api: {
    bodyParser: false, // Stream-ээр унших тул false хэвээр үлдээж болно
  },
};