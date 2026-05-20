const {  uploadOnCloudinary } = require ('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Upload the temporarily saved local file to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) {
      return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = uploadImage;