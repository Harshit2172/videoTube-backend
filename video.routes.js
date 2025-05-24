import { Router } from "express";
import { upload } from "../middlewares/multer";
import { uploadVideoAndThumbNail, videoData, getLikesAndComment } from "../controllers/video.controller";
import { verifyJwt } from "../middlewares/auth.middleware"
const router = Router();

router.route("/postVideo").post(
    upload.fields(
        [
            {
                name: thumbNail,
                maxCount: 1,
            },
            {
                name: videoFile,
                maxCount: 1,
            }])
    , uploadVideoAndThumbNail)
router.route("/getVideoData").post(videoData)
router.route("/getVideoAndThumbnail").post(uploadVideoAndThumbNail)
router.route("/getLikesAndComment").post(verifyJwt, getLikesAndComment)


export default router