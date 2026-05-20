const Router = require ('express');
const { upload} = require ('../config/cloudinary');
const uploadImage = require('../controllers/uploadController');

const router = Router();

// Route to handle a single image upload
router.post('/upload-image', upload.single('image'), uploadImage);


module.exports = router;