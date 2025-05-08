import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import formRoutes from "./routes/form.routes.js";
import questionRoutes from "./routes/question.routes.js";
import responseRoutes from "./routes/response.routes.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", formRoutes);
app.use(questionRoutes);
app.use("/api/v1", responseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
