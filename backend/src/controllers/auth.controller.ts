import { CREATED, OK } from "../constants/http";
import {
    createAccount,
    loginUser,
    sendPasswordResetEmail,
    verifyEmail,
} from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import {
    clearAuthCookies,
    getRefreshTokenCookieOptions,
    setAuthCookies,
} from "../utils/cookies";
import { z } from "zod";
import {
    registerSchema,
    loginSchema,
    verificationCodeSchema,
    emailSchema,
} from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import { UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAsserts";
import { refreshUserAccessToken } from "../services/auth.service";
import { getAccessTokenCookieOptions } from "../utils/cookies";

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

export const refreshHandler = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORIZED, "Refresh token is required");

    const { accessToken, newRefreshToken } = await refreshUserAccessToken(
        refreshToken
    );

    if (newRefreshToken) {
        res.cookie(
            "refreshToken",
            newRefreshToken,
            getRefreshTokenCookieOptions()
        );
    }

    return res
        .status(OK)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .json({
            message: "Access token refreshed",
        });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);

    await verifyEmail(verificationCode);

    return res.status(OK).json({
        message: "Email was verified successfully",
    });
});

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
    const email = emailSchema.parse(req.body.email);

    await sendPasswordResetEmail(email);

    return res.status(OK).json({
        message: "Password reset email sent",
    });
});
