const mongoose = require('mongoose');
const { serverError } = require('../lib/utils');
const Proposal = require("../models/Proposal");
const Work = require('../models/Work');
const Notification = require('../models/Notification');

module.exports = {
    createProposal: async (req, res) => {
        try {
            if (req.body) {
                const userId = req.user;
                const data = req.body;

                const updatedWork = await Work.findByIdAndUpdate({ _id: data.workId }, { $inc: { totalApplicants: 1 } })

                const createProposal = Proposal.create({
                    ...data, userId
                })

                const createNotification = Notification.create({
                    userId: updatedWork.userId,
                    notification: `Received a new proposal for work: ${updatedWork.title}`,
                    title: "New Proposal",
                    url: `/works/${updatedWork._id}`,
                })

                const result = await Promise.all([createProposal, createNotification]);

                if (result[0] && result[1]) {
                    res.status(201).json({ message: "Proposal submitted successfully" })
                } else {
                    res.status(500).json({ message: "Something went wrong!" })
                }

            } else {
                res.status(400).json({ message: "Invalid value!" });
            }
        } catch (error) {
            serverError(error, res);
        }
    },
    getProposalById: async (req, res) => {
        try {
            const { workId } = req.params;

            if (!workId) return res.status(400).json({ message: "Invalid work id" })

            const result = await Proposal.aggregate([
                {
                    $match: {
                        workId: mongoose.Types.ObjectId.createFromHexString(workId)
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
    },
    getProposals: async (req, res) => {
        try {
            const userId = req.user;

            const result = await Proposal.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId.createFromHexString(userId)
                    }
                },
                { $lookup: { from: "works", foreignField: "_id", localField: "workId", as: "work" } },
                { $unwind: "$work" },
                { $lookup: { from: "proposals", foreignField: "workId", localField: "workId", as: "proposals" } },
                {
                    $addFields: { 'work.totalApplicants': { $size: '$proposals' } }
                },
                { $project: { 'proposals': 0 } }
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