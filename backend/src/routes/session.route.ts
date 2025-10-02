import { Router } from "express";
import { getSessionsHandler } from "../controllers/session.controller";
import { deleteSessionHandler } from "../controllers/session.controller";
const sessionRoutes = Router();

// prefix: /sessions
sessionRoutes.get("/", getSessionsHandler);
sessionRoutes.delete("/:id", deleteSessionHandler);

export default sessionRoutes;
