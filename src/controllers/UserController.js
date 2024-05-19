const User = require('../models/User');
const Profile = require('../models/Profile');
const Socials = require('../models/Socials');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const { serverError } = require('../lib/utils');
const { upload } = require('../lib/firebase/upload');

module.exports = {
    register: async (req, res, next) => {
        try {
            if (req.body) {
                const { firstName, lastName, email, password, country } = req.body;
                if (!firstName || !lastName || !email || !password || !country) {
                    return res.status(400).json({ message: "Invalid value" })
                } else {
                    const existingUser = await User.findOne({ email });
                    if (existingUser) {
                        return res.status(409).json({ message: "Email already exists" })
                    } else {
                        const passwordHash = await bcrypt.hash(password, 10);
                        const newUser = await User.create({
                            firstName, lastName, email, password: passwordHash, country
                        })
                        await Profile.create({ userId: newUser._id })
                        await Socials.create({ userId: newUser._id })

                        req._id = newUser._id
                        next()
                    }
                }
            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    login: async (req, res, next) => {
        try {
            if (req.body) {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ message: "Invalid value" })
                } else {
                    const validUser = await User.findOne({ email });
                    if (!validUser) {
                        return res.status(401).json({ message: "Email not valid" })
                    } else {
                        const passwordMatch = await bcrypt.compare(password, validUser.password);
                        if (passwordMatch) {
                            req._id = validUser._id
                            next()
                        } else {
                            return res.status(401).json({ message: "Invalid user password" })
                        }
                    }
                }
            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getProfile: async (req, res) => {
        try {
            const userId = req.user;

            const userProfile = await User.aggregate([
                { $match: { _id: mongoose.Types.ObjectId.createFromHexString(userId) } },
                { $lookup: { from: "profiles", localField: "_id", foreignField: "userId", as: "profile" } },
                { $lookup: { from: "socials", localField: "_id", foreignField: "userId", as: "socials" } },
                { $unwind: '$profile' },
                { $unwind: '$socials' },
                {
                    $addFields: {
                        'profile.education': { $reverseArray: '$profile.education' }
                    }
                }
            ])

            if (userProfile.length > 0) {
                delete userProfile[0].password;
                delete userProfile[0].profile._id;
                delete userProfile[0].socials.userId;
                delete userProfile[0].socials._id;
            }


            res.status(200).json(userProfile[0]);
        } catch (error) {
            serverError(error, res);
        }
    },
    getClientProfile: async (req, res) => {
        try {
            const clientId = req.query.user;
            if (!mongoose.isValidObjectId(clientId)) return res.status(400).json({ message: "Invalid client id" })

            const userProfile = await User.aggregate([
                { $match: { _id: mongoose.Types.ObjectId.createFromHexString(clientId) } },
                { $lookup: { from: "profiles", localField: "_id", foreignField: "userId", as: "profile" } },
                { $lookup: { from: "socials", localField: "_id", foreignField: "userId", as: "socials" } },
                { $unwind: '$profile' },
                { $unwind: '$socials' }
            ])

            if (userProfile.length > 0) {
                delete userProfile[0].password;
                delete userProfile[0].profile._id;
                delete userProfile[0].socials.userId;
                delete userProfile[0].socials._id;
            }


            res.status(200).json(userProfile[0]);
        } catch (error) {
            serverError(error, res);
        }
    },
    updateProfile: async (req, res) => {
        try {
            if (req.body) {
                const profileData = req.body;
                const userId = req.user;

                // Update user
                const updateUser = User.updateOne({ _id: userId }, {
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    country: profileData.country
                })

                // Update user profile
                const updateProfile = Profile.updateOne({ userId }, {
                    role: profileData.role,
                    experience: profileData.experience,
                    hourly: profileData.hourly,
                    topFourSocials: profileData.topFourSocials
                })

                // Update user socials
                const updateSocials = Socials.updateOne(
                    { userId },
                    profileData.socials,
                    { upsert: true })

                const result = await Promise.all([updateUser, updateProfile, updateSocials])

                if (result[0].acknowledged && result[1].acknowledged) {
                    res.status(200).json({ message: "Profile updated successfully" });
                } else {
                    res.status(500).json({ message: "Failed to update profile" });
                }

            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            console.log(error);
            console.log(error);
            serverError(error, res)
        }
    },
    updateImage: async (req, res) => {
        try {
            if (req.body) {
                const { image, lookingForWork } = req.body;
                const userId = req.user;

                if (!image || image.startsWith("https://")) {
                    const result = await Profile.updateOne({ userId }, {
                        lookingForWork
                    })
                    if (result.acknowledged) {
                        res.status(200).json({ message: "Profile updated successfully." });
                    } else {
                        res.status(500).json({ message: "Failed to update profile" });
                    }
                } else {
                    // Upload Image to Firebase
                    const imageUrl = await upload(
                        image,
                        `/${userId}/` + "profile.jpg"
                    );

                    if (!imageUrl) {
                        return res.status(500).send("Unable to upload image!");
                    }

                    const imageResult = User.updateOne({ _id: userId }, {
                        image: imageUrl
                    })

                    const lookingForWorkResult = Profile.updateOne({ userId }, {
                        lookingForWork
                    })

                    const result = await Promise.all([imageResult, lookingForWorkResult]);

                    if (result[0].acknowledged && result[1].acknowledged) {
                        res.status(200).json({ message: "Profile image updated successfully.", image: imageUrl });
                    } else {
                        res.status(500).json({ message: "Failed to update profile image" });
                    }
                }


            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            console.log(error);
            serverError(error, res)
        }
    },
    updateAbout: async (req, res) => {
        try {
            if (req.body) {
                const { about } = req.body;
                const userId = req.user;
                const result = await Profile.updateOne({ userId }, {
                    about
                })

                if (result.acknowledged) {
                    res.status(200).json({ message: "About section updated successfully" });
                } else {
                    res.status(500).json({ message: "Failed to update About section" });
                }

            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            console.log(error);
            serverError(error, res)
        }
    },
    updateSkills: async (req, res) => {
        try {
            if (req.body) {
                const skills = req.body;
                const userId = req.user;
                const result = await Profile.updateOne({ userId }, {
                    skills
                })

                if (result.acknowledged) {
                    res.status(200).json({ message: "Skills updated successfully" });
                } else {
                    res.status(500).json({ message: "Failed to update Skills" });
                }

            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            console.log(error);
            serverError(error, res)
        }
    },
    addLanguage: async (req, res) => {
        try {
            const user = req.user;
            const newLanguage = req.body
            const language = await Profile.findOneAndUpdate({ userId: user }, { $push: { languages: newLanguage } })
            res.status(201).json(language);
        } catch (error) {
            serverError(error, res);
        }
    },
    editLanguage: async (req, res) => {
        try {
            const user = req.user;
            const languages = req.body
            const updatedLanguages = await Profile.findOneAndUpdate({ userId: user }, { languages })
            res.status(200).json(updatedLanguages);
        } catch (error) {
            serverError(error, res);
        }
    },
    addEducation: async (req, res) => {
        try {
            const user = req.user;
            const newEducation = req.body
            const newId = new mongoose.Types.ObjectId()
            await Profile.findOneAndUpdate({ userId: user }, { $push: { education: { _id: newId, ...newEducation } } });
            res.status(201).json({ _id: newId, ...newEducation });
        } catch (error) {
            serverError(error, res);
        }
    },
    deleteEducation: async (req, res) => {
        try {
            const user = req.user;
            const { educationId } = req.params;
            await Profile.findOneAndUpdate({ userId: user }, { $pull: { education: { _id: mongoose.Types.ObjectId.createFromHexString(educationId) } } })
            res.status(200).json({ message: "Education deleted successfully" });
        } catch (error) {
            serverError(error, res)
        }
    },
    editEducation: async (req, res) => {
        try {
            const user = req.user;
            const { _id, education } = req.body
            await Profile.findOneAndUpdate({ userId: user, "education._id": _id }, { $set: { "education.$": education } })
            res.status(200).json({ message: "Education updated successfully" });
        } catch (error) {
            console.log(error);
            serverError(error, res);
        }
    },
}