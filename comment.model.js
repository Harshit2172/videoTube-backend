import { mongoose, Schema } from "mongoose"


const commentSchema = new Schema({
    comments: {
        type: String,
        required: true,
    },
    replies: [{
        replyText: {
            type: String,
            required: true,
        },
        repliesBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    ], 
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true })


export const Comments = mongoose.model("Comments", commentSchema) 