const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const fs = require('fs');
const logger = require('../common/libs/logger');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if(!filePath){
      // If filePath is not provided, throw an error
      throw new Error('File path is required for upload');
    }

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'circuit_uploads', // The folder name in your Cloudinary console
      resource_type: 'auto', // Allow any file type (image, video, raw file formats like pdf)
    });
    // Optionally, you can delete the local file after uploading to Cloudinary
    logger.info(`File uploaded to Cloudinary: ${result.secure_url}`);
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error('Error deleting local file:', err);
      } else {
        logger.info('Local file deleted successfully');
      }
    });
    return result;
  } catch (error) {
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error('Error deleting local file after failed upload:', err);
        } else {
          logger.info('Local file deleted after failed upload successfully');
        }
      });
    }
    // Handle the error here, for example, by logging it or rethrowing it
    logger.error('Error uploading to Cloudinary:', error);
    return null; // Return null or handle the error as needed
  }
};
// Set up local disk storage for multer (saves temporarily before Cloudinary upload)
const storage = multer.diskStorage({});
const upload = multer({ storage });



module.exports = {
  uploadOnCloudinary,
  upload,
  cloudinary,
};
