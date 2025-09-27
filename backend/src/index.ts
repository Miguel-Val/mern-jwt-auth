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

app.get("/", (req, res, next) => {
    throw new Error("Test error");
    res.status(OK).json({
        status: "Healthy",
    });
});

app.use("/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} enviroment`);
    await connectDB();
});
