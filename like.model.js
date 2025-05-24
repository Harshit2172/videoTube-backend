import { mongoose, Schema } from "mongoose"


const likeSchema = new Schema({
    likes: {
        type: Number,
        default: 0,
        required: true,
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true })


export const Likes = mongoose.model("Likes", likeSchema) 