import { Request, Response } from "express";
import db from "../models/db.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";

export const getAccessibleFormDetail = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthenticated." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    await db.read();

    const user = db.data?.users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthenticated." });

    const form = db.data?.forms.find((f) => f.slug === req.params.form_slug);
    if (!form) return res.status(404).json({ message: "Form not found" });

    const userDomain = user.email.split("@")[1]?.toLowerCase();
    const isDomainAllowed =
      (form.allowedDomains ?? []).length === 0 ||
      (form.allowedDomains ?? []).some((domain) => {
        const normalized = domain.replace(/^www\./i, "").toLowerCase();
        return normalized === userDomain;
      });

    if (!isDomainAllowed) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const questions =
      db.data?.questions
        ?.filter((q) => q.form_id === form.id)
        .map((q) => ({
          id: q.id,
          name: q.name,
          choice_type: q.choice_type,
          choices: q.choices?.length ? q.choices.join(",") : null,
          is_required: q.is_required ? 1 : 0,
        })) ?? [];

    const userResponse = db.data?.responses?.find(
      (r) => r.form_id === form.id && r.user_id === user.id
    );

    return res.status(200).json({
      message: "Get form success",
      form: {
        id: form.id,
        name: form.title,
        slug: form.slug,
        description: form.description,
        limit_one_response: form.limitOneResponse ? 1 : 0,
        allowed_domains: form.allowedDomains,
        questions,
        answers: userResponse?.answers ?? null,
      },
    });
  } catch (err) {
    console.error("Form access error:", err);
    return res.status(401).json({ message: "Unauthenticated." });
  }
};
