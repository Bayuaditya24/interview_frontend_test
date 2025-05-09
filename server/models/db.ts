import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { DatabaseSchema } from "../types/types.js"; 

const adapter = new JSONFileSync<DatabaseSchema>("db.json");

const db = new LowSync<DatabaseSchema>(adapter, {
  users: [],
  sessions: [],
  forms: [],
  questions: [],
  responses: [],
});

db.read(); 
db.write(); 

export default db;
