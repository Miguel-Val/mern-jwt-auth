import { CREATED, OK } from "../constants/http";
import { createAccount, loginUser } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { setAuthCookies } from "../utils/cookies";
import { z } from "zod";
import { registerSchema, loginSchema } from "./auth.schemas";

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
