import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { DatabaseSchema } from "../types/types.js"; // pastikan sesuai dengan struktur kamu

const adapter = new JSONFileSync<DatabaseSchema>("db.json");

const db = new LowSync<DatabaseSchema>(adapter, {
  users: [],
  sessions: [],
  forms: [],
  questions: [],
  responses: [],
});

db.read(); // Memuat isi db.json ke db.data
db.write(); // Menyimpan default jika file kosong

export default db;
