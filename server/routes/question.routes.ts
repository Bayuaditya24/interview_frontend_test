import { Router } from "express";
import { addQuestionToForm } from "../controllers/question.controller.js";
import {
  removeQuestionFromForm,
  getQuestionsByFormSlug,
} from "../controllers/question.controller.js";
const router = Router();

// Add a question to a form
router.post("/api/v1/forms/:slug/questions", addQuestionToForm);
router.get("/api/v1/forms/:slug/questions", getQuestionsByFormSlug);
router.delete(
  "/api/v1/forms/:slug/questions/:question_id",
  removeQuestionFromForm
);

export default router;
