export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  if (process.env.NODE_ENV === "development") {
    return res
      .status(status)
      .json({ message, error: err.message, stack: err.stack });
  }

  res.status(status).json({ message });
};
