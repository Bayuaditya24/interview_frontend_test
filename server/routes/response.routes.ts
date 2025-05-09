import express from "express";
import {
  submitResponse,
  getResponsesByFormSlug,
} from "../controllers/response.controller.js";

const router = express.Router();

// Endpoint: POST /forms/:form_slug/responses
router.post("/forms/:form_slug/responses", submitResponse);
router.get("/forms/:slug/responses", getResponsesByFormSlug);

export default router;
