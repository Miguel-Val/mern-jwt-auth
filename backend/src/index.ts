import "dotenv/config";
import express from "express";
import connectDB from "./config/db";
import { PORT, NODE_ENV } from "./constants/env";
import cookieParser from "cookie-parser";
import cors from "cors";
import { APP_ORIGIN } from "./constants/env";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import authenticate from "./middleware/authenticate";
import userRoutes from "./routes/user.route";
import sessionRoutes from "./routes/session.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: APP_ORIGIN,
        credentials: true,
    })
);

app.get("/", (_, res) => {
    res.status(OK).json({
        status: "Healthy",
    });
});

// auth routes
app.use("/auth", authRoutes);

// protected routes
app.use("/user", authenticate, userRoutes);
app.use("/sessions", authenticate, sessionRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} enviroment`);
    await connectDB();
});
