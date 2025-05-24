import { asyncHandler } from "../utils/asyncHandler"
import { Tweets } from "../models/tweets.model"



const createTweets = asyncHandler(async (req, res) => {
    const { tweets } = req.body
    if (!tweets) {
        throw new ApiError(400, "Enter a comment")
    }
    const newTweet = await Tweets.create({
        tweets,
        tweetedBy: req.user._id
    });
    if (!newTweet) {
        throw new ApiError(400, "Tweet does not exist")
    }
    console.log(newTweet);

    res.status(200).json({
        tweets: newTweet,
        success: true,
    })

})
const getAllTweets=asyncHandler(async (req, res) =>{

    const tweets= await Tweets.aggregate([
        {
            $lookup:{
                  from: "Comments",
                 localField: "tweetedBY",
                foreignField: "_id",
                as: "comments "
            }
        }, {
            $unwind:"$comments"
        },{
            $sort:{createdAt:-1}
        },
    ]);
    res.status(200).json({
        success:true,
        tweets,
    })
});
export {
    createTweets,
}