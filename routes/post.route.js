const express = require("express")
const router = express.Router()
const post_controller = require("../controllers/post.controller")
const auth = require("../middleware/auth")

router.put("/like",auth, post_controller.like)

router.put("/comment",auth, post_controller.comment)

router.put("/share",auth, post_controller.share)

router.put("/save",auth, post_controller.save)

module.exports = router