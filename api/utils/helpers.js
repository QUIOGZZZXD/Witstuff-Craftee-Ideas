import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const sendResponse = (res, data = null, error = null, status = 200) => {
  res.status(status).json({ data, error });
};

const uploadToCloudinary = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "wci", public_id: filename?.replace(/\.[^/.]+$/, "") },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export { hashPassword, sendResponse, uploadToCloudinary };
