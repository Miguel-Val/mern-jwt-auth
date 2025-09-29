import { CREATED, OK } from "../constants/http";
import { createAccount, loginUser } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { z } from "zod";
import { registerSchema, loginSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";

export const registerHandler = catchErrors(async (req, res, next) => {
    // validate request
    const request = registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });

    //call service
    const { user, refreshToken, accessToken } = await createAccount(request);

    // return response
    return setAuthCookies({ res, refreshToken, accessToken })
        .status(CREATED)
        .json({ user });
});

export const loginHandler = catchErrors(async (req, res, next) => {
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });

    const { refreshToken, accessToken } = await loginUser(request);

    return setAuthCookies({ res, refreshToken, accessToken })
        .status(OK)
        .json({ message: "Login successful" });
});

export const logoutHandler = catchErrors(async (req, res) => {
    const accessToken = req.cookies.accessToken as string | undefined;
    const { payload } = verifyToken(accessToken || "");

    if (payload) {
        // remove session from db
        await SessionModel.findByIdAndDelete(payload.sessionId);
    }

    // clear cookies
    return clearAuthCookies(res)
        .status(OK)
        .json({ message: "Logout successful" });
});
