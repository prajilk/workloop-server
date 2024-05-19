const express = require('express');
const router = express.Router();
const {
    register,
    login,
    updateProfile,
    updateAbout,
    updateSkills,
    getProfile,
    updateImage,
    getClientProfile,
    addLanguage,
    editLanguage,
    addEducation,
    deleteEducation,
    editEducation
} = require('../controllers/UserController');
const createToken = require('../middleware/createToken');
const verifyToken = require('../middleware/verifyToken');

// Auth
router.post('/register', register, createToken)
router.post('/login', login, createToken);
router.get('/verify', verifyToken, (_, res) => {
    res.status(200).json({ message: "User verified successfully!" })
});

// Profile
router.get('/profile', verifyToken, getProfile);
router.get('/client-profile', getClientProfile);
router.patch('/profile', verifyToken, updateProfile);
router.put('/image', verifyToken, updateImage);
router.put('/about', verifyToken, updateAbout);

// Skills
router.put('/skills', verifyToken, updateSkills);

// Language
router.post('/language', verifyToken, addLanguage);
router.put('/language', verifyToken, editLanguage);

// Education
router.post('/education', verifyToken, addEducation);
router.put('/education', verifyToken, editEducation);
router.delete('/education/:educationId', verifyToken, deleteEducation);

module.exports = router;