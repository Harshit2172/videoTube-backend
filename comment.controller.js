import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError"
import { Comments } from "../models/comment.model"

const comments = asyncHandler(async (req, res) => {
    const { comment,videoId } = req.body;

    if (!comment||videoId) {
        throw new ApiError(400, "Enter a comment")
    }
    const newComment = await Comments.create({
        comment,
        video:videoId,
        commentedBy: req.user._id
    })

    if (!newComment) {
        throw new ApiError(400, "User not found")
    }

    res.status(200).json({

       comment: newComment,
       success:true,
    })

})
 
 
export {
    comments,
}