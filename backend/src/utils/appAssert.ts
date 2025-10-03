import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/http";
import AppError from "./appError";
import assert from "node:assert";

type AppAssert = (
    condition: any,
    httpStatusCode: HttpStatusCode,
    message: string,
    appErrorCode?: AppErrorCode
) => asserts condition;

// Assert a condition and throws an AppError if the condition is falsy

const appAssert: AppAssert = (
    condition: any,
    httpStatusCode,
    message: string,
    appErrorCode
) => assert(condition, new AppError(message, httpStatusCode, appErrorCode));

export default appAssert;
