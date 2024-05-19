const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.TOKEN_SECRET
            );

            if (typeof decoded === "string") {
                throw new Error();
            }

            req.user = decoded._id;

            next()
        } catch (error) {
            return res.status(403).json({ message: "Invalid signature" })
        }
    } else {
        return res.status(403).json({ message: "Auth token is missing!" })
    }
}

module.exports = verifyToken