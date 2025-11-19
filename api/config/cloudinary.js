import { v2 as cloudinary } from "cloudinary";
import { environment } from "../constants/environment.js";

cloudinary.config({
  cloud_name: environment.CLOUDINARY_NAME,
  api_key: environment.CLOUDINARY_API_KEY,
  api_secret: environment.CLOUDINARY_API_SECRET,
});

export default cloudinary;