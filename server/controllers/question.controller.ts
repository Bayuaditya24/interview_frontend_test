import { Request, Response } from "express";
import db from "../models/db.js";
import { Form, Question } from "../types/types.js";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const counterFilePath = path.join(__dirname, "../data/questionIdCounter.json");

const SECRET_KEY = "your-secret-key";

// Function to get the next available question ID (auto-increment)
async function getNextQuestionId(): Promise<number> {
  try {
    const data = await fs.readFile(counterFilePath, "utf-8");
    const json = JSON.parse(data);
    const nextId = json.lastId + 1;

    // Update the counter in the file with the new ID
    await fs.writeFile(
      counterFilePath,
      JSON.stringify({ lastId: nextId }, null, 2)
    );

    return nextId;
  } catch (err) {
    console.error("Error reading question ID counter:", err);
    throw new Error("Could not generate new question ID");
  }
}

// Add a new question to a form
export const addQuestionToForm = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const { slug } = req.params;
  const { name, choice_type, choices, is_required } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    await db.read();
    const form = db.data?.forms.find((f) => f.slug === slug);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.creatorId !== decoded.id) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const errors: any = {};
    if (!name) errors.name = ["The name field is required."];
    if (!choice_type)
      errors.choice_type = ["The choice type field is required."];

    if (
      ["multiple choice", "dropdown", "checkboxes"].includes(choice_type) &&
      (!Array.isArray(choices) ||
        !choices.every((choice) => typeof choice === "string"))
    ) {
      errors.choices = ["The choices must be an array of strings."];
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: "Invalid field", errors });
    }

    const newQuestionId = await getNextQuestionId();

    const newQuestion: Question = {
      id: newQuestionId,
      name,
      choice_type,
      choices: choices || [],
      is_required: !!is_required,
      form_id: form.id,
    };

    db.data?.questions.push(newQuestion); // ⬅️ simpan ke questions, bukan forms
    await db.write();

    return res.status(200).json({
      message: "Add question success",
      question: newQuestion,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthenticated." });
  }
};

export const removeQuestionFromForm = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  const { slug, question_id } = req.params;

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const questionIdNum = parseInt(question_id);

    await db.read();

    const form = db.data?.forms.find((f) => f.slug === slug);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.creatorId !== decoded.id) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const questionIndex = db.data?.questions.findIndex(
      (q) => q.id === questionIdNum && q.form_id === form.id
    );

    if (questionIndex === -1 || questionIndex === undefined) {
      return res.status(404).json({ message: "Question not found" });
    }

    db.data?.questions.splice(questionIndex, 1); // Hapus question
    await db.write();

    return res.status(200).json({ message: "Remove question success" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(401).json({ message: "Unauthenticated." });
  }
};

// Controller untuk mengambil pertanyaan berdasarkan slug
export const getQuestionsByFormSlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    await db.read();

    // Cari form berdasarkan slug
    const form = db.data?.forms.find((f) => f.slug === slug);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Cari semua pertanyaan yang sesuai dengan form_id
    const questions = db.data?.questions.filter((q) => q.form_id === form.id);

    return res.status(200).json({
      message: "Questions fetched successfully",
      questions,
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
