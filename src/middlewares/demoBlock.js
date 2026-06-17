import { forbiddenException } from "../utils/httpResponse.js";

export const demoBlock = (req, res, next) => {
  if (req.session?.rol === "admin_demo") {
    return forbiddenException(res, "Demo mode — acción deshabilitada");
  }
  next();
};
