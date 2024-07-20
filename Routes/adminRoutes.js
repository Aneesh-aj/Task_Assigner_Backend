const exprees = require("express")
const router = exprees.Router()
const Authentication = require("../Auth/auth")


const adminController = require("../Controller/adminController")

router.post("/adminLogin",adminController.adminLogin)
router.get("/getUsers",Authentication.auth,adminController.getUser)
router.post("/createTask",Authentication.auth,adminController.createTask)
router.get("/getTasks",Authentication.auth,adminController.getTasks)
router.put("/updateTask",Authentication.auth,adminController.updateTask)

module.exports = router