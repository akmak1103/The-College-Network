const express = require("express")
const router = express.Router()
const index_controller = require("../controllers/index.controller")

router.get("/", index_controller.homePage)
router.get("/signup", index_controller.signupPage)
router.get("/signin", index_controller.signinPage)

module.exports = router;