import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: HttpStatusCode,
        public errorCode?: AppErrorCode
    ) {
        super(message);
    }
}

export default AppError;
