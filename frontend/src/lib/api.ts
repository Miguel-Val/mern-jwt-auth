import API from "../config/apiClient";
import type {
    LoginData,
    RegisterData,
    ResetPasswordData,
    User,
    Session,
} from "../types";

export const login = async (data: LoginData) => API.post("/auth/login", data);
export const logout = async () => API.get("/auth/logout");
export const register = async (data: RegisterData) =>
    API.post("/auth/register", data);
export const verifyEmail = async (code: string) =>
    API.get(`/auth/email/verify/${code}`);
export const sendPasswordResetEmail = async (email: string) =>
    API.post("/auth/password/forgot", { email });

export const resetPassword = async ({
    verificationCode,
    password,
}: ResetPasswordData) =>
    API.post("/auth/password/reset", { verificationCode, password });
export const getUser = async () => API.get("/user") as Promise<{ user: User }>;
export const getSessions = async () =>
    API.get("/sessions") as Promise<Session[]>;
export const deleteSession = async (id: string) =>
    API.delete(`/sessions/${id}`);
