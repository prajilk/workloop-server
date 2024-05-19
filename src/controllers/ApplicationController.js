const mongoose = require('mongoose');
const { serverError } = require('../lib/utils');
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const Job = require("../models/Job");

module.exports = {
    createApplication: async (req, res) => {
        try {
            if (req.body) {
                const userId = req.user;
                const data = req.body;

                const updatedJob = await Job.findByIdAndUpdate({ _id: data.jobId }, { $inc: { totalApplicants: 1 } })

                const createApplication = Application.create({
                    ...data, userId
                })

                const createNotification = Notification.create({
                    userId: updatedJob.userId,
                    notification: `Received a new application for job: ${updatedJob.title}`,
                    title: "New Application",
                    url: `/jobs/${updatedJob._id}`,
                })

                const result = await Promise.all([createApplication, createNotification]);

                if (result[0] && result[1]) {
                    res.status(201).json({ message: "Application submitted successfully" })
                } else {
                    res.status(500).json({ message: "Something went wrong!" })
                }

            } else {
                res.status(400).json({ message: "Invalid value!" });
            }
        } catch (error) {
            console.log(error);
            serverError(error, res);
        }
    },
    getApplicationById: async (req, res) => {
        try {
            const { jobId } = req.params;

            if (!jobId) return res.status(400).json({ message: "Invalid job id" })

            const result = await Application.aggregate([
                {
                    $match: {
                        jobId: mongoose.Types.ObjectId.createFromHexString(jobId)
                    }
                },
                { $lookup: { from: "users", foreignField: "_id", localField: "userId", as: "user" } },
                { $unwind: "$user" },
                { $lookup: { from: "profiles", foreignField: "userId", localField: "userId", as: "profile" } },
                { $unwind: "$profile" },
                {
                    $addFields: {
                        'user.role': '$profile.role',
                        'user.experience': '$profile.experience',
                    }
                },
                {
                    $project: {
                        'profile': 0,
                        'user.password': 0,
                        'user.createdAt': 0,
                        'user.updatedAt': 0
                    }
                }
            ]);

            if (result) {
                res.status(200).json(result)
            } else {
                res.status(500).json({ message: "Something went wrong!" })
            }
        } catch (error) {
            serverError(error, res);
        }
    }
}