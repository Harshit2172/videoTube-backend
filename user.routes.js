import { Router } from "express"
import { logInUser, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        }, {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser)
router.route("/logIn").post(logInUser)
// secured rooutes 
router.route("/logOut").post(verifyJwt, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)



export default router
