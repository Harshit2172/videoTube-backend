import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { getVideoDuration } from "../utils/getVideoDuration";
import { User } from "../models/user.model";
// get the title and description of the video 
// get video from user
// upload it on localstorage
// access that video from localstorage
// upload on it on cloudinary
// get cloudinary url or string and sent the url to frontend
// send a message that video is uplaoded  

const videoData = asyncHandler(async (req, res) => {

    const { description, title } = req.body
    if (!description && !title) {
        throw new ApiError(200, "Description and title are required")
    }
    const videoPath = req.files?.videoFile[0]?.path;
    if (!videoPath) {
        throw new ApiError(400, "videoFile not sent")
    }
    if (videoPath) {
        try {
            const duration = await getVideoDuration(videoPath);
            console.log("Video duration in minutes:", duration);
        } catch (error) {
            console.error("Error getting duration :", error);
        }
    }

    res.status(200).json({
        Description: description,
        Title: title,
        duration,
        message: "Description and title of the video",
    })
})

const uploadVideoAndThumbNail = asyncHandler(async (req, res) => {

    const localvideoStored = req.files?.videoFile[0]?.path;
    const thumbNailStored = req.files?.thumbNail[0]?.path;
    if (!localvideoStored && !thumbNailStored) {
        throw new ApiError(400, "video and thumbnail not available")
    }
    const videoOnCloudinary = await uploadOnCloudinary(localvideoStored)
    const thumbNailOnCloudinary = await uploadOnCloudinary(thumbNailStored)

    if (!videoOnCloudinary && thumbNailOnCloudinary) {
        throw new ApiError(500, "Video and thumbnail uploaded failed .Please try agaian later")
    }

    res.status(200).json({
        url: videoOnCloudinary.url,

        thumbNail: thumbNailOnCloudinary.url,

        message: "Video uploaded Successfully",

        thumbNailmessage: "thumbNail uploaded Successfully",
    })
})
const getLikesAndComment= asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    const commentPipeline=User.aggregate( [
        {
            $match:{
                _id:user._id
            },
        },
        {
            $lookUp: {
                from: "Comments",
                 localField: "author",
                foreignField: "_id",
                as: "comments "
            },
        },
        {
            $unwind:"$comments"
        },
        {
            $lookUp:{
                 from: "Likes",
                 localField: "_id",
                foreignField: "likedBy",
                as: "likes "
            }, 
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
            },
        },
        
    ] );
    res.status(200).json({
        success:true,
        commentPipeline,
    })
})

export {
    uploadVideoAndThumbNail,
    videoData,
    getLikesAndComment
}