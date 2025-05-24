import { mongoose, Schema } from "mongoose"


const viewsSchema = new Schema({
    views: {
        type: Number,
        default: 0,
        required: true,
    },
    viewedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
}, { timestamps: true })


export const View = mongoose.model("View", viewsSchema) 