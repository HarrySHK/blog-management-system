import multer from "multer";

export const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});