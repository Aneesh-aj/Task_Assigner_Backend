const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key" 

const auth = (req, res, next) => {
    const token = req.cookies["authToken"];

    console.log(" auth token",token)

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); 
        next(); 
    });
};

module.exports = { auth };
