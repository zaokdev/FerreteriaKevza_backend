import { unauthorizedException } from "../utils/httpResponse.js";

export const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return unauthorizedException(res);
  }
  next();
};
