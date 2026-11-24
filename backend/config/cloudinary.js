// config/cloudinary.js

const cloudinary = require("cloudinary").v2;

if (process.env.CLOUDINARY_URL) {
  // Cloudinary automatically parses CLOUDINARY_URL if present
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = cloudinary;