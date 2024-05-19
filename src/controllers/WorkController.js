const mongoose = require('mongoose');
const { serverError } = require('../lib/utils');
const Work = require("../models/Work");

module.exports = {
    createWork: async (req, res) => {
        try {
            if (req.body) {
                const userId = req.user;
                const workData = req.body;

                const result = await Work.create({ userId, ...workData });

                if (result) {
                    res.status(201).json({ message: "Work created successfully" })
                } else {
                    res.status(500).json({ message: "Failed to create work" });
                }
            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getWorks: async (req, res) => {
        try {
            const { page, limit } = req.query;
            const result = await Work.find().sort({ createdAt: -1 }).skip(page === 1 ? 0 : limit * (page - 1)).limit(limit);

            if (result) {
                res.status(200).json(result)
            } else {
                res.status(500).json({ message: "Something went wrong!" });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getWorkById: async (req, res) => {
        try {
            const { workId } = req.params;

            const user = req.user;
            const pipeline = [
                { $match: { _id: mongoose.Types.ObjectId.createFromHexString(workId) } },
                { $lookup: { from: "users", foreignField: "_id", localField: "userId", as: "user" } },
                { $unwind: "$user" },
                { $lookup: { from: "works", foreignField: "userId", localField: "user._id", as: "userWorks" } },
                { $addFields: { 'user.totalWorks': { $size: "$userWorks" } } },
                { $lookup: { from: "proposals", foreignField: "workId", localField: "_id", as: "proposals" } },
                {
                    $addFields: {
                        'hasApplied': {
                            $in: [user ? mongoose.Types.ObjectId.createFromHexString(user) : "", '$proposals.userId']
                        },
                        'totalApplicants': { $size: '$proposals' }
                    }
                },
                {
                    $project: {
                        'userWorks': 0,
                        'proposals': 0,
                        'user.password': 0,
                        'user.image': 0,
                        'user.email': 0,
                        'user.createdAt': 0,
                        'user.updatedAt': 0
                    }
                }
            ];

            if (!user) {
                pipeline.splice(5, 2)
            }

            const result = await Work.aggregate(pipeline)

            if (result.length !== 0) {
                res.status(200).json(result[0])
            } else {
                res.status(404).json({ message: "Invalid work id!" });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getWorksByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            const result = await Work.aggregate([
                { $match: { userId: mongoose.Types.ObjectId.createFromHexString(userId) } },
                { $lookup: { from: "proposals", foreignField: "workId", localField: "_id", as: "proposals" } },
                {
                    $addFields: {
                        'totalApplicants': { $size: '$proposals' }
                    }
                },
                { $project: { 'proposals': 0 } }
            ]);

            if (result) {
                res.status(200).json(result)
            } else {
                res.status(500).json({ message: "Something went wrong!" });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    updateWorkStatus: async (req, res) => {
        try {
            if (req.body) {
                const userId = req.user;
                const { status, workId } = req.body;

                const result = await Work.updateOne({ _id: workId, userId }, { closed: status });

                if (result.acknowledged) {
                    res.status(200).json({ message: "Work status updated successfully" });
                } else {
                    res.status(500).json({ message: "Something went wrong!" })
                }

            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            serverError(error, res);
        }
    },
    deleteWork: async (req, res) => {
        try {
            const userId = req.user;
            const { workId } = req.params;

            const result = await Work.deleteOne({ _id: workId, userId });

            if (result.acknowledged) {
                res.status(201).json({ message: "Work deleted successfully" })
            } else {
                res.status(500).json({ message: "Failed to delete work" });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    searchWorks: async (req, res) => {
        try {
            const filter = req.body;
            const { q } = req.query;

            // Initialize an empty query object
            let query = [];

            // Check if location filter is applied
            if (filter.location) {
                query.push({ location: filter.location })
            }

            // Check if fixed filter is applied
            if (filter.hourly && filter.fixed) {
                query.push({
                    payment: {
                        $in: ["hourly", "fixed"]
                    }
                })
            } else if (filter.fixed && !filter.hourly) {
                query.push({
                    payment: {
                        $in: ["fixed"]
                    }
                })
            } else if (!filter.fixed && filter.hourly) {
                query.push({
                    payment: {
                        $in: ["hourly"]
                    }
                })
            }

            // Check if paymentMin is applied
            if (Number(filter.paymentMin) > 0) {
                query.push({
                    paymentMin: { $gte: Number(filter.paymentMin) }
                })
            }

            // Check if paymentMax is applied
            if (Number(filter.paymentMax) > 0) {
                query.push({
                    paymentMax: { $gte: Number(filter.paymentMax) }
                })
            }

            // Check if experience filter is applied
            if (filter.experience) {
                let experienceLevels = [];
                if (filter.experience.entry) {
                    experienceLevels.push("entry");
                }
                if (filter.experience.intermediate) {
                    experienceLevels.push("intermediate");
                }
                if (filter.experience.expert) {
                    experienceLevels.push("expert");
                }
                if (experienceLevels.length > 0) {
                    query.push({
                        experience: { $in: experienceLevels }
                    })
                }
            }

            // Check if number of applicants filter is applied
            if (filter.numberOfApplicants) {
                let applicantRanges = [];
                if (filter.numberOfApplicants["<5"]) {
                    applicantRanges.push({ totalApplicants: { $lt: 5 } });
                }
                if (filter.numberOfApplicants["5-10"]) {
                    applicantRanges.push({ totalApplicants: { $gte: 5, $lt: 10 } });
                }
                if (filter.numberOfApplicants["10-15"]) {
                    applicantRanges.push({ totalApplicants: { $gte: 10, $lt: 15 } });
                }
                if (filter.numberOfApplicants["15-20"]) {
                    applicantRanges.push({ totalApplicants: { $gte: 15, $lte: 20 } });
                }
                if (filter.numberOfApplicants[">20"]) {
                    applicantRanges.push({ totalApplicants: { $gt: 20 } });
                }
                // Repeat similar checks for other applicant ranges
                if (applicantRanges.length > 0) {
                    query.push({
                        $or: applicantRanges
                    })
                }
            }

            let regexPattern = new RegExp(q, 'i');

            const works = await Work.find({
                $and: [
                    {
                        $or: [
                            { title: { $regex: regexPattern } },
                            { description: { $regex: regexPattern } },
                            { "skills": { $elemMatch: { label: { $regex: regexPattern } } } }
                        ]
                    },
                    ...query
                ]
            })

            res.status(200).json(works)
        } catch (error) {
            console.log(error);
            serverError(error, res)
        }
    }
}