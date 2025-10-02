import { Router } from "express";
import { getUserHandler } from "../controllers/user.controller";

const userRoutes = Router();

// prefix: /users
userRoutes.get("/", getUserHandler);

export default userRoutes;
