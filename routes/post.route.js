const express = require("express")
const router = express.Router()
const post_controller = require("../controllers/post.controller")
const auth = require("../middleware/auth")

router.put("/like/:id",auth, post_controller.like)

router.post("/comment/:id",auth, post_controller.comment)

router.put("/save/:id",auth, post_controller.save)

module.exports = router