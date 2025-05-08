import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../models/db.js";
import { User } from "../types/types.js";

const SECRET_KEY = "your-secret-key"; // Ganti untuk keamanan

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body; // Ganti dari username ke email

  await db.read();
  const user = db.data?.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username, // ← tambahkan ini
    },
  });
};

export const logout = async (_req: Request, res: Response) => {
  // Dengan JWT, logout dilakukan di sisi frontend (hapus token)
  res.json({ message: "Logged out (client-side)" });
};
