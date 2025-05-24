import { mongoose, Schema } from "mongoose"


const notificationSchema = new Schema({
    notification: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required5: true,
        enum: ["like", "comment", "follow", "tweet", "reply"]
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reciever: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        required: true,
    }
}, { timestamps: true })


export const Notification = mongoose.model("Notification", notificationSchema)