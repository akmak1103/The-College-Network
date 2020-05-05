const express = require("express")
const router = express.Router()
const post_controller = require("../controllers/post.controller")
const auth = require("../middleware/auth")

router.put("/like/:id",auth, post_controller.like)              //working

router.post("/comment/:id",auth, post_controller.comment)       //working

module.exports = router