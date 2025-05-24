import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model"

const likes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    res.status(200).json({
        userId: user._id
    })
})


export {
    likes
}