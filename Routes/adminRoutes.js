const exprees = require("express")
const router = exprees.Router()
const adminController = require("../Controller/adminController")

router.post("/login",adminController.login)

module.exports = router