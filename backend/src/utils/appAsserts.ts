import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";
import AppError from "./appError";
import assert from "node:assert";

type AppAsserts = (
    condition: any,
    httpStatusCode: HttpStatusCode,
    message: string,
    appErrorCode?: AppErrorCode
) => asserts condition;

// Asserts a condition and throws an AppError if the condition is falsy

const appAsserts: AppAsserts = (
    condition: any,
    httpStatusCode,
    message: string,
    appErrorCode
) => assert(condition, new AppError(message, httpStatusCode, appErrorCode));

export default appAsserts;
