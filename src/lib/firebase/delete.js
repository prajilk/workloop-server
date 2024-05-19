const { getStorage, ref, listAll, deleteObject } = require("firebase/storage");

// Initialize Firebase Storage
const storage = getStorage();

module.exports = {
    deleteFilesInFolder: async (folderPath) => {
        try {
            // Create a reference to the folder
            const folderRef = ref(storage, folderPath);

            // List all items (files and folders) in the folder
            const { items } = await listAll(folderRef);

            // Delete each item (file or folder) in the folder
            await Promise.all(
                items.map(async (item) => {
                    // Delete file
                    await deleteObject(item);
                })
            );

            return true;
        } catch (error) {
            return null;
        }
    }
}