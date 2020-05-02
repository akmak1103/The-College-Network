const express = require("express")
const router = express.Router()
const index_controller = require("../controllers/index.controller")
const auth = require("../middleware/auth")

router.get("/", index_controller.homepage)
router.get("/verificationEmail",index_controller.emailSent)
router.get("/feed",index_controller.feed)

module.exports = router;