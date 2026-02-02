import multer from "multer";

const storage = multer.memoryStorage();
const uploadMemory = multer({ storage });

export default uploadMemory;
