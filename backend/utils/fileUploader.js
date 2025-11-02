import { v2 as cloudinary } from "cloudinary";
import { mediaModel } from "../models/media.js";
import { v4 as uuid } from "uuid";
import { getBase64 } from "../lib/helper.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFilesToCloudinary = async (files = []) => {
  try {
    const uploadPromises = files.map((file) => {
      const fileExtension = file.mimetype.split("/")[1];
      const resourceType = file.mimetype.startsWith("image/") ? "image" : "raw";

      return cloudinary.uploader.upload(getBase64(file), {
        resource_type: resourceType,
        public_id: `${uuid()}.${fileExtension}`,
      }).then((result) => ({
        fileUrl: result.secure_url,
        fileType: file.mimetype,
      }));
    });

    const mediaDocuments = await Promise.all(uploadPromises);
    const savedMedia = await mediaModel.insertMany(mediaDocuments);

    return savedMedia.map((media) => media._id);
  } catch (error) {
    throw new Error(`Error uploading files to Cloudinary: ${error.message}`);
  }
};
