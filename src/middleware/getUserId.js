const jwt = require('jsonwebtoken');

function getUserId(req, _, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.TOKEN_SECRET
            );

            req.user = decoded._id;

            next()
        } catch (error) {
            next()
        }
    } else {
        next()
    }
}

module.exports = getUserId