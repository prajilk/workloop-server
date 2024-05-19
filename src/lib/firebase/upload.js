const { ref, uploadString, getDownloadURL } = require("firebase/storage")
const { storage } = require("../../config/firebase")

module.exports = {
    upload: async (image, filename) => {
        try {
            const storageRef = ref(storage, filename);
            await uploadString(storageRef, image, "data_url");
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}