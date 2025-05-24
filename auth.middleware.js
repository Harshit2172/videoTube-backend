import { JsonWebTokenError } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";


export const verifyJwt = asyncHandler(async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized Request")
        }
        const decodedInformation = JsonWebTokenError.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedInformation?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        req.user = user
        next()
    }
    catch (error) {
        throw new ApiError(401, error || " Invalid access token ")

    }

})