const mongoose = require("mongoose");
const { serverError, generateRandomString } = require("../lib/utils")
const Portfolio = require("../models/Portfolio");
const { upload } = require("../lib/firebase/upload");
const { deleteFilesInFolder } = require("../lib/firebase/delete")

module.exports = {
    createPortfolio: async (req, res) => {
        try {
            const user = req.user;
            const data = req.body;
            if (data && Object.keys(data).length > 0) {
                const newProjectId = new mongoose.Types.ObjectId();
                const projectImagesPromise = data.images.map(image => upload(image, `${user}/portfolio/${newProjectId}/${generateRandomString(10)}.jpg`))

                const successfulImageUrls = await handleImageUploads(projectImagesPromise);

                if (successfulImageUrls.length === 0) {
                    return res.status(500).send("Failed to upload images!");
                }

                const newPortfolio = await Portfolio.create({ _id: newProjectId, userId: user, ...data, images: successfulImageUrls.map(image => ({ url: image })) })

                res.status(201).json({ newPortfolio, message: `${successfulImageUrls.length}/${data.images.length} Images uploaded successfully.` })
            } else {
                return res.status(400).json({ message: "Invalid data format" })
            }
        } catch (error) {
            console.log(error);
            serverError(error, res);
        }
    },
    getAllPortfolios: async (req, res) => {
        try {
            const user = req.user;
            const allPortfolios = await Portfolio.find({ userId: mongoose.Types.ObjectId.createFromHexString(user) });
            return res.status(200).json(allPortfolios?.reverse())
        } catch (error) {
            serverError(error, res)
        }
    },
    deletePortfolio: async (req, res) => {
        try {
            const user = req.user;
            const { projectId } = req.params

            const isImagesDeleted = await deleteFilesInFolder(`${user}/portfolio/${projectId}`)

            if (isImagesDeleted) {
                const deleteProject = await Portfolio.deleteOne({ userId: user, _id: projectId })
                res.status(200).json({ message: "Project deleted successfully." })
            } else {
                res.status(500).json({ message: "Unable to delete project images!" })
            }
        } catch (error) {
            serverError(error, res);
        }
    }
}

async function handleImageUploads(projectImagesPromise) {
    const results = await Promise.allSettled(projectImagesPromise);
    const imageUrls = results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value; // Assuming the resolved value is the image URL
        } else {
            console.error(`Image upload ${index} failed:`, result.reason);
            return null; // Or handle the error in some other way
        }
    });

    // Filter out null values to get only the successful image URLs
    const successfulImageUrls = imageUrls.filter(url => url !== null);

    return successfulImageUrls;
}