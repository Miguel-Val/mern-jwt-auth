import { NOT_FOUND, OK } from "../constants/http";
import UserModel from "../models/user.model";
import appAsserts from "../utils/appAsserts";
import catchErrors from "../utils/catchErrors";

export const getUserHandler = catchErrors(async (req, res) => {
    const user = await UserModel.findById(req.userId);
    appAsserts(user, NOT_FOUND, "User not found");
    return res.status(OK).json({
        user: user.omitPassword(),
    });
});
