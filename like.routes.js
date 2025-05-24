import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware"
import { likes } from "../controllers/like.controller";
// import { upload } from "../middlewares/multer";

const router = Router()

router.route("liked").post(verifyJwt, likes)