export type CreatAccountParams = {
    email: string;
    password: string;
    userAgent?: string;
};

export const createAccount = async (data: CreatAccountParams) => {
    // verify existing user doesnt exist
    // create user
    // create verification code
    // send verification email
    // create session
    // sign access token & refresh token
    // return user & tokens
};
