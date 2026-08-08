import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customer.routes";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import followupRoutes from "./routes/followup.routes";
import challanRoutes from "./routes/challan.routes";
import dashboardRoutes from "./routes/dashboard.routes";
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
app.use("/api/customers", customerRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/followups", followupRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;