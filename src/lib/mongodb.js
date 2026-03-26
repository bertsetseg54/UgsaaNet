import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
// Хуучин options-уудыг устгаад хоосон объект үлдээх эсвэл шууд устгаж болно
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Хөгжүүлэлтийн явцад (Fast Refresh) холболтыг дахин дахин үүсгэхээс сэргийлнэ
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri); // Options шаардлагагүй болсон
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production орчинд шинэ холболт үүсгэнэ
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
