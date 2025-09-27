const enum AppErrorCode {
    InvalidAccessToken = "InvalidAccessToken",
    InvalidRefreshToken = "InvalidRefreshToken",
    ExpiredAccessToken = "ExpiredAccessToken",
    ExpiredRefreshToken = "ExpiredRefreshToken",
    InvalidEmailOrPassword = "InvalidEmailOrPassword",
    UserAlreadyExists = "UserAlreadyExists",
    UserNotFound = "UserNotFound",
    UserNotVerified = "UserNotVerified",
}

export default AppErrorCode;
