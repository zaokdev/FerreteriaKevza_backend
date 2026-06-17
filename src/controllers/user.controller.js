import asyncHandler from "express-async-handler";
import { userService } from "../services/user.service.js";
import { ok } from "../utils/httpResponse.js";

export const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAll(req.query);
  return ok(res, result);
});

export const getUserById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await userService.getById(id);
  return ok(res, { user });
});

export const banUser = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { isBanned } = req.body;
  const user = await userService.ban(id, isBanned);
  return ok(res, { user });
});
