import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";


const notificationController=asyncHandler(async(req,res)=>{
// agr user hai to user id usse me jb user log in kre to notification du user logged in
// agr video hai to send noti if video is uploaded and liked and if someone commented and somone liked the comment and replied to the comment
// agr tweet hai to jb tweet kre tb noti and like and when somone comments and like to your tweet  
})



export {
    notificationController,
}