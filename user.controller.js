import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import JsonWebTokenError from "jsonwebtoken"
import { Subscription } from "../models/subscription.model.js"


// const registerUser = asyncHandler(async (req, res) => {

//     res.status(200).json({
//         message:"Chai aur code"
//     })

// })
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save(validateBeforeSave = false)
        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {




    const { username, password, email, fullname } = req.body
    console.log(username, email);

    if ([username, password, email, fullname].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    })
    if (existedUser) {
        throw new ApiError(409, "User with emaill or username already existes")
    }
    const avatarLocalFilePath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;

    }

    if (!avatarLocalFilePath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalFilePath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file iis required")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password,
        email,
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered succesfully"))
})

const logInUser = asyncHandler(async (req, res) => {  
    const { email, username, password } = req.body
    if (!username || email) {
        throw new ApiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user crdentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true,
    }
    
    return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiError(200, {
                user: accessToken, refreshToken
            }, "User logged in Successfully"
            )
        )
}
)

const logOutUser = asyncHandler(async () => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged  out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = JsonWebTokenError.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newrefreshToken }, "Accessed token refreshed successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const currentPassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    const user = await User.findById(req.user._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldpassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newpassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password chanheged"))
})

const getCurrentUser = asyncHandler((req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "All deals are required")
    }
    const user = await User.findById(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(200, user, "Acounts details updates successfully")
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Avatar image updated successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Cover image upadted successfully"))
})

const getuserChannelProfile = asyncHandler(async () => {
    const { username } = req.params
    if (!username) {
        throw new ApiError(400, "username is missing")
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookUp: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookUp: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        {
            $addFields: {
                subscriberCount: {
                    $size: "subscribers"
                },
                channelSubscribedToCount: {
                    $size: "subscribedTo"
                },
                isSubscribed: {
                    cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])
    // console.log(channel);
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})

export {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    currentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getuserChannelProfile,
}