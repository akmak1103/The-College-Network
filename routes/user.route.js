const express = require("express")
const router = express.Router()
const user_controller = require("../controllers/user.controller")
const auth = require("../middleware/auth")

router.post("/signup", user_controller.signup)

router.put("/verify/:hash",user_controller.verifyUser)

router.post("/signin", user_controller.signin)

router.post("/signout", auth, user_controller.signout)

router.post("/signoutall", auth, user_controller.signoutall)

router.post("/resetpassword", auth, user_controller.resetPass)

router.get("/", auth, user_controller.dashboard)

router.put("/", auth, user_controller.update)

router.get("/feed", auth, user_controller.feed)

router.post("/post", auth, user_controller.createpost)

router.get("/post", auth, user_controller.myposts)

module.exports = router