import { CookieOptions, Response } from "express";
import { fiftenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/auth/refresh";

const defaults: CookieOptions = {
    sameSite: "strict",
    httpOnly: true,
    secure: true,
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: fiftenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH,
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

export const clearAuthCookies = (res: Response) =>
    res
        .clearCookie("accessToken")
        .clearCookie("refreshToken", { path: REFRESH_PATH });
