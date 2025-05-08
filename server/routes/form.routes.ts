import express from "express";
import {
  createForm,
  getUserForms,
  getFormDetail,
  getFormResponses,
} from "../controllers/form.controller.js";
import { getAccessibleFormDetail } from "../controllers/formAccessController.js";

const router = express.Router();

router.post("/forms", createForm);
router.get("/forms", getUserForms);
router.get("/forms/:slug", getFormDetail);
router.get("/forms/:form_slug/detail", getAccessibleFormDetail);
router.get("/:slug/responses", getFormResponses);
export default router;
