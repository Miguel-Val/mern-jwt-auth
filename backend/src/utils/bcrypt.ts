import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds: number = 8) => {
    return await bcrypt.hash(value, saltRounds || 10);
};

export const compareValue = async (value: string, hashedValue: string) => {
    return await bcrypt.compare(value, hashedValue).catch((err) => false);
};
