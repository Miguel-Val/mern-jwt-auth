import VerificationCodeType from "../constants/verificationCodeType";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import {
    oneYearFromNow,
    ONE_DAY_MS,
    thirtyDaysFromNow,
    fiveMinutesAgo,
    oneHourFromNow,
} from "../utils/date";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET, APP_ORIGIN } from "../constants/env";
import SessionModel from "../models/session.model";
import appAsserts from "../utils/appAsserts";
import {
    getPasswordResetTemplate,
    getVerifyEmailTemplate,
} from "../utils/emailTemplates";
import {
    CONFLICT,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    TOO_MANY_REQUESTS,
    UNAUTHORIZED,
} from "../constants/http";
import {
    accessTokenSignOptions,
    refreshTokenSignOptions,
    signToken,
    verifyToken,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";

export type CreatAccountParams = {
    email: string;
    password: string;
    userAgent?: string;
};

export const createAccount = async (data: CreatAccountParams) => {
    // verify existing user doesnt exist
    const existingUser = await UserModel.exists({
        email: data.email,
    });

    appAsserts(!existingUser, CONFLICT, "Email already in use");
    // if (existingUser) {
    //     throw new Error("User already exists");
    // }

    // create user
    const user = await UserModel.create({
        email: data.email,
        password: data.password,
    });

    const userId = user._id;

    // create verification code
    const verificationCode = await VerificationCodeModel.create({
        userId: user._id,
        type: VerificationCodeType.EmailVerification,
        expiresAt: oneYearFromNow(),
    });

    const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

    // send verification email
    try {
        await sendMail({
            to: user.email,
            ...getVerifyEmailTemplate(url),
        });
    } catch (error) {
        console.log(error);
    }

    // create session
    const session = await SessionModel.create({
        userId,
        userAgent: data.userAgent,
    });

    // sign access token & refresh token
    const refreshToken = signToken(
        { sessionId: session._id },
        refreshTokenSignOptions
    );

    const accessToken = signToken({
        userId,
        sessionId: session._id,
    });

    // return user & tokens
    return { user: user.omitPassword(), refreshToken, accessToken };
};

type LoginUserParams = {
    email: string;
    password: string;
    userAgent?: string;
};

export const loginUser = async ({
    email,
    password,
    userAgent,
}: LoginUserParams) => {
    // get the user by email
    const user = await UserModel.findOne({ email });
    appAsserts(user, UNAUTHORIZED, "Invalid email or password");

    //validate password from the rquest
    const isValid = await user.comparePassword(password);
    appAsserts(isValid, UNAUTHORIZED, "Invalid email or password");

    const userId = user._id;

    //create a session
    const session = await SessionModel.create({
        userId,
        userAgent,
    });

    const sessionInfo = {
        sessionId: session._id,
    };

    //sign access token & refresh token
    const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);

    const accessToken = signToken({
        ...sessionInfo,
        userId,
    });

    //return user & tokens
    return {
        user: user.omitPassword(),
        refreshToken,
        accessToken,
    };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
    const { payload } = verifyToken(refreshToken, {
        secret: refreshTokenSignOptions.secret,
    });
    appAsserts(payload, UNAUTHORIZED, "Invalid refresh token");

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();
    appAsserts(
        session && session.expiresAt.getTime() > now,
        UNAUTHORIZED,
        "Session Expired"
    );

    // refresh the session if it expires in the next 24 hours

    const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = thirtyDaysFromNow();
        await session.save();
    }

    const newRefreshToken = sessionNeedsRefresh
        ? signToken(
              {
                  sessionId: session._id,
              },
              refreshTokenSignOptions
          )
        : undefined;

    const accessToken = signToken({
        userId: session.userId,
        sessionId: session._id,
    });

    return {
        accessToken,
        newRefreshToken,
    };
};

export const verifyEmail = async (code: string) => {
    // get the verification code
    const validCode = await VerificationCodeModel.findOne({
        _id: code,
        type: VerificationCodeType.EmailVerification,
        expiresAt: { $gt: new Date() },
    });
    appAsserts(validCode, NOT_FOUND, "Invalid verification code");

    //update user verified to true
    const updatedUser = await UserModel.findByIdAndUpdate(
        validCode.userId,
        { verified: true },
        { new: true }
    );
    appAsserts(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

    //delete verification code
    await validCode.deleteOne();

    //return user
    return {
        user: updatedUser.omitPassword(),
    };
};

export const sendPasswordResetEmail = async (email: string) => {
    // Catch any errors that were thrown and log them (but always return a success)
    // This will prevent leaking sensitive data back to the client (e.g. user not found, email not sent).
    try {
        const user = await UserModel.findOne({ email });
        appAsserts(user, NOT_FOUND, "User not found");

        // check for max password reset requests (2 emails in 5min)
        const fiveMinAgo = fiveMinutesAgo();
        const count = await VerificationCodeModel.countDocuments({
            userId: user._id,
            type: VerificationCodeType.PasswordReset,
            createdAt: { $gt: fiveMinAgo },
        });
        appAsserts(
            count <= 1,
            TOO_MANY_REQUESTS,
            "Too many requests, please try again later"
        );

        const expiresAt = oneHourFromNow();
        const verificationCode = await VerificationCodeModel.create({
            userId: user._id,
            type: VerificationCodeType.PasswordReset,
            expiresAt,
        });

        const url = `${APP_ORIGIN}/password/reset?code=${
            verificationCode._id
        }&exp=${expiresAt.getTime()}`;

        const { data, error } = await sendMail({
            to: email,
            ...getPasswordResetTemplate(url),
        });

        appAsserts(
            data?.id,
            INTERNAL_SERVER_ERROR,
            `${error?.name} - ${error?.message}`
        );
        return {
            url,
            emailId: data.id,
        };
    } catch (error: any) {
        console.log("SendPasswordResetError:", error.message);
        return {};
    }
};
