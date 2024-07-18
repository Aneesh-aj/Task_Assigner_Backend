
const exprees = require("express")
const router = exprees.Router()

const userController = require("../Controller/userController")

router.post("/userSignup",userController.signup)
router.post("/otpVerify",userController.verifyOtp)


module.exports = router