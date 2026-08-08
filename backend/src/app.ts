import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Mini ERP CRM Backend Running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

export default app;