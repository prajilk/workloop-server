function serverError(error, res) {
    if (error.message.endsWith("timed out after 10000ms"))
        return res.status(503).json({ message: "No internet connection!" })
    res.status(500).json({ message: "Something went wrong. Server Error!" })
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

module.exports = {
    serverError,
    generateRandomString
}