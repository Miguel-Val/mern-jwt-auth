import API from "../config/apiClient";

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
}

export const login = async (data: LoginData) => API.post("/auth/login", data);
export const register = async (data: RegisterData) =>
    API.post("/auth/register", data);
