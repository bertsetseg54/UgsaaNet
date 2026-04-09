import bcrypt from "bcryptjs";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { name, email, password, familyId, familyName } = req.body;

    if (!name || !email || !password || !familyId) {
      return res.status(400).json({ message: "Мэдээлэл дутуу байна" });
    }

    const client = await clientPromise;
    const db = client.db("mydb");
    
    // 1. Имэйл шалгах
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "Имэйл бүртгэлтэй байна" });

    // 2. Ургийн сангийн логик (Эрх ялгахгүй)
    // Тухайн familyId-тай ураг байгаа эсэхийг шалгана
    const existingFamily = await db.collection("families").findOne({ familyId });
    
    if (!existingFamily) {
      // Хэрэв ураг байхгүй бол шинээр үүсгэнэ
      await db.collection("families").insertOne({ 
        familyId, 
        familyName: familyName || "Шинэ ураг", 
        createdAt: new Date() 
      });
    }

    // 3. Хэрэглэгчийг хадгалах
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      familyId, // Бүх хэрэглэгч өөрийн ургийн кодтой байна
      createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ success: true, user: { ...userWithoutPassword, _id: result.insertedId } });

  } catch (error) {
    return res.status(500).json({ message: "Серверийн алдаа: " + error.message });
  }
}