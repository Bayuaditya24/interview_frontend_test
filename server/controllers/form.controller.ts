// controllers/formController.ts
import { Request, Response } from "express";
import db from "../models/db.js";
import { Form } from "../types/types.js";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const counterFilePath = path.join(__dirname, "../data/formIdCounter.json");

const SECRET_KEY = "your-secret-key"; // gunakan env var di production

// Validasi sederhana slug
const isValidSlug = (slug: string) =>
  /^[a-zA-Z0-9.-]+$/.test(slug) && !/\s/.test(slug);

async function getNextFormId(): Promise<number> {
  try {
    const data = await fs.readFile(counterFilePath, "utf-8");
    const json = JSON.parse(data);
    const nextId = json.lastId + 1;

    // Update file dengan ID terbaru
    await fs.writeFile(
      counterFilePath,
      JSON.stringify({ lastId: nextId }, null, 2)
    );

    return nextId;
  } catch (err) {
    console.error("Error reading form ID counter:", err);
    throw new Error("Could not generate new ID");
  }
}

export const createForm = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    const { name, slug, description, allowed_domains, limit_one_response } =
      req.body;

    const errors: any = {};

    if (!name) errors.name = ["The name field is required."];
    if (!slug) {
      errors.slug = ["The slug field is required."];
    } else {
      if (!isValidSlug(slug)) {
        errors.slug = [
          "The slug must be alphanumeric with dash '-' or dot '.', and no spaces.",
        ];
      } else {
        await db.read();
        const slugExists = db.data?.forms.some((f) => f.slug === slug);
        if (slugExists) {
          errors.slug = ["The slug has already been taken."];
        }
      }
    }

    if (
      allowed_domains &&
      (!Array.isArray(allowed_domains) ||
        !allowed_domains.every((d) => typeof d === "string"))
    ) {
      errors.allowed_domains = ["The allowed domains must be an array."];
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: "Invalid field",
        errors,
      });
    }

    const newForm: Form = {
      id: await getNextFormId(), // ← ini auto increment
      title: name,
      slug,
      description: description || "",
      allowedDomains: allowed_domains || [],
      limitOneResponse: !!limit_one_response,
      creatorId: decoded.id,
    };

    db.data?.forms.push(newForm);
    await db.write();

    return res.status(200).json({
      message: "Create form success",
      form: {
        name: newForm.title,
        slug: newForm.slug,
        description: newForm.description,
        limit_one_response: newForm.limitOneResponse,
        creator_id: newForm.creatorId,
        id: newForm.id,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthenticated." });
  }
};

export const getUserForms = async (req: Request, res: Response) => {
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

    const userDomain = user.email.split("@")[1]?.toLowerCase();

    // Gabungkan form yang dibuat user sendiri DAN form user lain yang allowed
    const forms =
      db.data?.forms
        ?.filter((form) => {
          const isOwnForm = form.creatorId === decoded.id;
          const isDomainAllowed = form.allowedDomains?.some((domain) => {
            const normalized = domain.replace(/^www\./i, "").toLowerCase();
            return normalized === userDomain;
          });
          return isOwnForm || isDomainAllowed;
        })
        ?.map((form) => ({
          id: form.id,
          name: form.title,
          slug: form.slug,
          description: form.description,
          limit_one_response: form.limitOneResponse ? 1 : 0,
          creator_id: form.creatorId,
        })) ?? [];

    return res.status(200).json({
      message: "Get all forms success",
      forms,
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthenticated." });
  }
};

export const getFormDetail = async (req: Request, res: Response) => {
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

    const form = db.data?.forms.find((f) => f.slug === req.params.slug);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const userDomain = user.email.split("@")[1]?.toLowerCase();
    const isDomainAllowed = form.allowedDomains?.some((domain) => {
      const normalizedAllowed = domain.replace(/^www\./i, "").toLowerCase();
      return userDomain === normalizedAllowed;
    });

    if (!isDomainAllowed) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    // Fetch questions for this form
    const questions =
      db.data?.questions
        ?.filter((q) => q.form_id === form.id)
        .map((q) => ({
          id: q.id,
          form_id: q.form_id,
          name: q.name,
          choice_type: q.choice_type,
          choices: q.choices?.length ? q.choices.join(",") : null,
          is_required: q.is_required ? 1 : 0,
        })) ?? [];

    return res.status(200).json({
      message: "Get form success",
      form: {
        id: form.id,
        name: form.title,
        slug: form.slug,
        description: form.description,
        limit_one_response: form.limitOneResponse ? 1 : 0,
        creator_id: form.creatorId,
        allowed_domains: form.allowedDomains,
        questions,
      },
    });
  } catch (err) {
    console.error("Error in getFormDetail:", err);
    return res.status(401).json({ message: "Unauthenticated." });
  }
};

// controllers/formController.ts

export const getFormResponses = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    const form = db.data?.forms.find((f) => f.slug === req.params.slug);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Periksa apakah pembuat formulir yang mengakses respons
    if (form.creatorId !== decoded.id) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    // Ambil semua respons untuk formulir ini
    const responses = db.data?.responses?.filter((r) => r.form_id === form.id);

    return res.status(200).json({
      message: "Get responses success",
      responses,
    });
  } catch (err) {
    console.error("Error in getFormResponses:", err);
    return res.status(401).json({ message: "Unauthenticated." });
  }
};
