import express from "express";
import cors from "cors";
import {
  handleRegister,
  handleRequestOtp,
  handleVerifyOtp,
  handleGetMe,
  handleListUsers,
  handleAdminCreateUser,
  handleUpdateUser,
  handleDeleteUser,
} from "./routes/auth";
import {
  handleGenerateQuote,
  handleShareQuote,
  handleGetQuoteSettings,
  handleUpdateQuoteSettings,
  handleGetQuote,
} from "./routes/quote";

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Demo routes
  app.get("/api/ping", (_req, res) => res.json({ message: "pong" }));
  app.get("/api/demo", (_req, res) =>
    res.json({ message: "Hello from Express!" })
  );

  // Auth routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/request-otp", handleRequestOtp);
  app.post("/api/auth/verify-otp", handleVerifyOtp);
  app.get("/api/auth/me", handleGetMe);

  // Admin User Management
  app.get("/api/admin/users", handleListUsers);
  app.post("/api/admin/users", handleAdminCreateUser);
  app.put("/api/admin/users/:id", handleUpdateUser);
  app.delete("/api/admin/users/:id", handleDeleteUser);

  // Quote Engine
  app.post("/api/quotes/generate", handleGenerateQuote);
  app.post("/api/quotes/share", handleShareQuote);
  app.get("/api/quotes/settings", handleGetQuoteSettings);
  app.put("/api/quotes/settings", handleUpdateQuoteSettings);
  app.get("/api/quotes/:id", handleGetQuote);

  return app;
}
