import multer from "multer";

const storage = multer.memoryStorage();

const uploadMemory = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // máx 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
      err.message = "Solo se permiten imágenes";
      return cb(err);
    }
    cb(null, true);
  },
});

export default uploadMemory;
