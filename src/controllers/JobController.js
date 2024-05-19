const mongoose = require('mongoose');
const { serverError } = require('../lib/utils');
const Job = require("../models/Job");

module.exports = {
    createJob: async (req, res) => {
        try {
            if (req.body) {

                const userId = req.user;
                const jobData = req.body;

                const result = await Job.create({ userId, ...jobData });

                if (result) {
                    res.status(201).json({ message: "Job created successfully" })
                } else {
                    res.status(500).json({ message: "Failed to create Job" });
                }
            } else {
                res.status(400).json({ message: "Invalid value" })
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getJobs: async (req, res) => {
        try {
            const { page, limit } = req.query;
            const result = await Job.find().sort({ createdAt: -1 }).skip(page === 1 ? 0 : limit * (page - 1)).limit(limit);

            if (result) {
                res.status(200).json(result)
            } else {
                res.status(500).json({ message: "Something went wrong!" });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    getJobById: async (req, res) => {
        try {
            const { jobId } = req.params;

            const user = req.user;
            const pipeline = [
                { $match: { _id: mongoose.Types.ObjectId.createFromHexString(jobId) } },
                { $lookup: { from: "users", foreignField: "_id", localField: "userId", as: "user" } },
                { $unwind: "$user" },
                { $lookup: { from: "jobs", foreignField: "userId", localField: "user._id", as: "userJobs" } },
                { $addFields: { 'user.totalJobs': { $size: "$userJobs" } } },
                { $lookup: { from: "applications", foreignField: "jobId", localField: "_id", as: "applications" } },
                {
                    $addFields: {
                        'hasApplied': {
                            $in: [user ? mongoose.Types.ObjectId.createFromHexString(user) : "", '$applications.userId']
                        },
                        'totalApplicants': { $size: '$applications' }
                    }
                },
                {
                    $project: {
                        'userJobs': 0,
                        'applications': 0,
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

            const result = await Job.aggregate(pipeline);

            if (result.length !== 0) {
                res.status(200).json(result[0]);
            } else {
                res.status(404).json({ message: "Invalid job id!" });
            }


        } catch (error) {
            console.log(error);
            serverError(error, res)
        }
    },
    getJobsByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            const result = await Job.aggregate([
                { $match: { userId: mongoose.Types.ObjectId.createFromHexString(userId) } },
                { $lookup: { from: "applications", foreignField: "jobId", localField: "_id", as: "applications" } },
                {
                    $addFields: {
                        'totalApplicants': { $size: '$applications' }
                    }
                },
                { $project: { 'applications': 0 } }
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
    updateJobStatus: async (req, res) => {
        try {
            if (req.body) {
                const userId = req.user;
                const { status, jobId } = req.body;

                const result = await Job.updateOne({ _id: jobId, userId }, { closed: status });

                if (result.acknowledged) {
                    res.status(200).json({ message: "Job status updated successfully" });
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
    deleteJob: async (req, res) => {
        try {
            const userId = req.user;
            const { jobId } = req.params;

            const result = await Job.deleteOne({ _id: jobId, userId });

            if (result.acknowledged) {
                res.status(201).json({ message: "Job deleted successfully" })
            } else {
                res.status(500).json({ message: "Failed to delete job" });
            }
        } catch (error) {
            serverError(error, res)
        }
    },
    searchJobs: async (req, res) => {
        try {
            const filter = req.body;
            const { q } = req.query;

            // Initialize an empty query object
            let query = [];

            // Check if location filter is applied
            if (filter.location) {
                query.push({ location: filter.location })
            }

            // Check if experience filter is applied
            if (filter.jobType) {
                let jobTypes = [];
                if (filter.jobType.remote) {
                    jobTypes.push("remote");
                }
                if (filter.jobType.OnSite) {
                    jobTypes.push("on-site");
                }
                if (filter.jobType.hybrid) {
                    jobTypes.push("hybrid");
                }
                if (jobTypes.length > 0) {
                    query.push({
                        jobType: { $in: jobTypes }
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

            const jobs = await Job.find({
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

            res.status(200).json(jobs)
        } catch (error) {
            console.log(error);
            serverError(error, res)
        }
    }
}