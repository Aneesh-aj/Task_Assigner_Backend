const Authentication = require("../Auth/auth")
const exprees = require("express")
const router = exprees.Router()

const userController = require("../Controller/userController")

router.post("/userSignup",userController.signup)
router.post("/otpVerify",userController.verifyOtp)
router.post("/userLogin",userController.login)
router.post("/resendOtp",userController.resendOtp)
router.post("/userLogout",userController.logout)
router.get("/getTasks/:id",Authentication.auth,userController.getTasks)
router.put("/startTask",Authentication.auth,userController.startTask)
router.put("/endTask",Authentication.auth,userController.endTask)
router.get("/fetchTask/:id",Authentication.auth,userController.fetchTask)


module.exports = router