const {  uploadOnCloudinary } = require ('../config/cloudinary');
const logger = require('../common/libs/logger');


const uploadImage = async (req, res) => {
  try {
    logger.info('Upload image request received');
    if (!req.file) {
      logger.info('Upload failed: No file found in the request payload');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    logger.info(`Processing file for upload. Local Path: ${req.file.path}, Original Name: ${req.file.originalname}`);
    // Upload the temporarily saved local file to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) {
      logger.info('Cloudinary upload failed: uploadOnCloudinary returned null');
      return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
    }

    logger.info(`File successfully uploaded to Cloudinary: ${uploadResult.secure_url}`);
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    logger.info(`Upload controller encountered an exception: ${error.message}`);
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = uploadImage;