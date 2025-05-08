// controllers/responseController.ts
import { Request, Response } from "express";
import db from "../models/db.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key"; // Jangan lupa pakai dotenv

export const submitResponse = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    await db.read();

    const user = db.data?.users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthenticated." });
    }

    const form = db.data?.forms.find((f) => f.slug === req.params.form_slug);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const { answers } = req.body;

    // Validasi struktur jawaban
    if (!Array.isArray(answers)) {
      return res.status(422).json({
        message: "Invalid field",
        errors: {
          answers: ["The answers field is required."],
        },
      });
    }

    // Ambil questions form ini
    const questions =
      db.data?.questions?.filter((q) => q.form_id === form.id) ?? [];

    // Jika `limitOneResponse` = true → cari jika sudah pernah submit
    const hasSubmitted = db.data?.responses?.some(
      (r) => r.form_id === form.id && r.user_id === user.id
    );

    if (form.limitOneResponse && hasSubmitted) {
      return res.status(422).json({
        message: "You can not submit form twice",
      });
    }

    // Validasi setiap required question
    const requiredErrors = questions
      .filter((q) => q.is_required)
      .filter((q) => {
        const answer = answers.find((a) => a.question_id === q.id);
        return !answer || !answer.value?.toString().trim();
      });

    if (requiredErrors.length > 0) {
      return res.status(422).json({
        message: "Invalid field",
        errors: {
          answers: requiredErrors.map((q) => `Question ${q.id} is required.`),
        },
      });
    }

    // Simpan response ke database
    const responseId = (db.data?.responses?.length ?? 0) + 1;

    db.data?.responses?.push({
      id: responseId,
      form_id: form.id,
      user_id: user.id,
      answers: answers.map((a) => ({
        question_id: a.question_id,
        value: a.value,
      })),
      submitted_at: new Date().toISOString(),
    });

    await db.write();

    return res.status(200).json({ message: "Submit response success" });
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(401).json({ message: "Unauthenticated." });
  }
};

export const getResponsesByFormSlug = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    await db.read();

    const form = db.data?.forms.find((f) => f.slug === slug);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const responses =
      db.data?.responses
        ?.filter((r) => r.form_id === form.id)
        .map((r) => ({
          user_id: r.user_id,
          answers: r.answers,
          submitted_at: r.submitted_at,
        })) ?? [];

    return res.status(200).json({ responses });
  } catch (err) {
    console.error("Get responses error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
