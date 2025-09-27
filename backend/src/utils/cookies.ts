import { CookieOptions, Response } from "express";
import { fiftenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = process.env.NODE_ENV !== "development";

const defaults: CookieOptions = {
    sameSite: "strict",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: fiftenMinutesFromNow(),
});

const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: "/auth/refresh",
});

type Params = {
    res: Response;
    refreshToken: string;
    accessToken: string;
};
export const setAuthCookies = ({ res, refreshToken, accessToken }: Params) =>
    res
        .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions())
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions());
