import { logger } from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} — ${err.message}\n${err.stack}`);
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  if (process.env.NODE_ENV === "development") {
    return res
      .status(status)
      .json({ message, error: err.message, stack: err.stack });
  }

  res.status(status).json({ message });
};
