import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
//Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Saving file
const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) return null;
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    if (!result.url) {
      return null;
    }
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log(error);
    return null;
  }
};

export { uploadOnCloudinary };

export const deleteFromCloudinary = async function (url) {
  try {
    const pathParts = url.split("/");

    // Get the last part of the array (after the last '/')
    const lastString = pathParts[pathParts.length - 1];

    const filenameParts = lastString.split(".");

    // Get the filename without the extension
    const filenameWithoutExtension = filenameParts[0];
    await cloudinary.api.delete_resources(filenameWithoutExtension);
    return "success";
  } catch (error) {
    return "error";
  }
};
