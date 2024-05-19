const mongoose = require('mongoose');
const { serverError } = require('../lib/utils');
const Bookmark = require('../models/Bookmark');

module.exports = {
    getBookmarks: async (req, res) => {
        try {
            const user = req.user;
            const bookmarks = await Bookmark.find({ userId: mongoose.Types.ObjectId.createFromHexString(user) });
            res.status(200).json(bookmarks);
        } catch (error) {
            serverError(error, res)
        }
    },
    updateBookmark: async (req, res) => {
        try {
            const user = req.user;
            const id = req.body;
            const isBookmarked = await Bookmark.findOne({
                $or: [
                    { userId: user, [Object.keys(id)[0]]: id[Object.keys(id)[0]] },
                ]
            });

            if (isBookmarked) {
                await Bookmark.deleteOne({
                    $or: [
                        { userId: user, [Object.keys(id)[0]]: id[Object.keys(id)[0]] }
                    ]
                });
                res.status(200).json({ message: "Bookmark removed successfully!", bookmarked: false });
            } else {
                await Bookmark.create(
                    { userId: user, [Object.keys(id)[0]]: id[Object.keys(id)[0]] }
                );
                res.status(200).json({ message: "Bookmark saved successfully!", bookmarked: true });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getBookmarkedJobs: async (req, res) => {
        try {
            const user = req.user;
            const bookmarkedJobs = await Bookmark.aggregate([
                { $match: { userId: mongoose.Types.ObjectId.createFromHexString(user), jobId: { $exists: true } } },
                { $lookup: { from: "jobs", foreignField: "_id", localField: "jobId", as: "jobs" } },
                { $unwind: "$jobs" }
            ])
            res.status(200).json(bookmarkedJobs)
        } catch (error) {
            serverError(error, res)
        }
    },
    getBookmarkedWorks: async (req, res) => {
        try {
            const user = req.user;
            const bookmarkedWorks = await Bookmark.aggregate([
                { $match: { userId: mongoose.Types.ObjectId.createFromHexString(user), workId: { $exists: true } } },
                { $lookup: { from: "works", foreignField: "_id", localField: "workId", as: "works" } },
                { $unwind: "$works" }
            ])
            res.status(200).json(bookmarkedWorks)
        } catch (error) {
            serverError(error, res)
        }
    }
}