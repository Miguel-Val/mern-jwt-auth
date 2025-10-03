export interface User {
    _id: string;
    email: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Session {
    _id: string;
    createdAt: string;
    userAgent: string;
    isCurrent: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordData {
    verificationCode: string;
    password: string;
}
