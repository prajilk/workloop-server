const jwt = require('jsonwebtoken');

function createToken(req, res) {

    const id = req._id

    const token = jwt.sign({
        _id: id,
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1d"
    })

    res.status(200).json({ token, message: "Token created successfully" })
}

module.exports = createToken