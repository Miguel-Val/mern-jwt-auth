import { CREATED } from "../constants/http";
import { createAccount } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { setAuthCookies } from "../utils/cookies";
import { z } from "zod";

const registerSchema = z
    .object({
        email: z.string().email().min(1).max(255),
        password: z.string().min(6).max(255),
        confirmPassword: z.string().min(6).max(255),
        userAgent: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

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
