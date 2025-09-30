import { Router } from "express";
import {
    registerHandler,
    loginHandler,
    logoutHandler,
    refreshHandler,
} from "../controllers/auth.controller";

const authRoutes = Router();

// prefix: /auth

authRoutes.post("/register", registerHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/logout", logoutHandler);

export default authRoutes;
