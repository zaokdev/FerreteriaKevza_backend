import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { sessionMiddleware } from "./config/session.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { handleStripeWebhook } from "./controllers/checkout.controller.js";
import { authRouter } from "./routes/auth.routes.js";
import { categoryRouter } from "./routes/category.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { checkoutRouter } from "./routes/checkout.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { userRouter } from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Webhook de Stripe — ANTES de express.json() para preservar el body crudo
// La firma de Stripe se verifica con el buffer sin parsear
app.post("/webhook/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());
app.use(sessionMiddleware);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", orderRouter);
app.use("/api/users", userRouter);

// Middleware global de errores — siempre al último
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
