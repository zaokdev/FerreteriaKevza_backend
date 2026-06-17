import { forbiddenException } from "../utils/httpResponse.js";

export const requireRole = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.session?.rol)) {
      return forbiddenException(res);
    }
    next();
  };
