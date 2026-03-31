import bcrypt from "bcryptjs";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const { name, email, password, familyId } = req.body;

  if (!name || !email || !password || !familyId) {
    return res.status(400).json({ message: "Бүх талбарыг бөглөнө үү" });
  }

  const client = await clientPromise;
  const db = client.db("mydb");
  const users = db.collection("users");

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Имэйл бүртгэлтэй байна" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await users.insertOne({
    name,
    email,
    password: hashedPassword,
    familyId,
    createdAt: new Date(),
  });

  res.status(201).json({ message: "Амжилттай бүртгэгдлээ" });
}
