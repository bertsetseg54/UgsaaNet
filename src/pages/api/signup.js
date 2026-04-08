import bcrypt from "bcryptjs";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { name, email, password, familyId, familyName, role } = req.body;

    if (!name || !email || !password || !familyId) {
      return res.status(400).json({ message: "Мэдээлэл дутуу байна" });
    }

    const client = await clientPromise;
    const db = client.db("mydb");
    
    // 1. Хэрэглэгч шалгах
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "Имэйл бүртгэлтэй байна" });

    // 2. Гэр бүл үүсгэх/шалгах
    if (role === "admin") {
      await db.collection("families").insertOne({ familyId, familyName, createdAt: new Date() });
    } else {
      const family = await db.collection("families").findOne({ familyId });
      if (!family) return res.status(400).json({ message: "Ургийн код буруу байна" });
    }

    // 3. Хадгалах
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      familyId,
      role: role || "member",
      createdAt: new Date()
    };

    await db.collection("users").insertOne(newUser);

    // Нууц үгийг хасаад фронтенд рүү явуулах
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ success: true, user: userWithoutPassword });

  } catch (error) {
    return res.status(500).json({ message: "Серверийн алдаа: " + error.message });
  }
}