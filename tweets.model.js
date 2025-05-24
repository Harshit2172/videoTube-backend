import { mongoose, Schema } from "mongoose"


const tweetsSchema = new Schema({

    tweets: {
        type: String,
        required: true,
    },
    tweetedBY: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tweetedTo: {
        type: Schema.Types.ObjectId,
        req: "User",
        required: true,
    },
    retweet: {
        type: String,
        required: true,
    },
    like: {
        type: Number,
        required: true,
        default: 0,
    }


}, { timestamps: true })


export const Tweets = mongoose.model("Tweets", tweetsSchema)