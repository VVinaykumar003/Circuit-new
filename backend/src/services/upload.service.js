const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");
const logger = require("../common/libs/logger");

/**
 * Sanitize a filename to prevent directory traversal or invalid characters in cloud storage
 * @param {string} name 
 * @returns {string}
 */
const sanitizeFilename = (name) => {
  if (!name || typeof name !== "string") return "attachment";
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .substring(0, 100);
};

/**
 * Upload a memory buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - Upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBuffer = async (buffer, options = {}) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Valid buffer is required for upload");
  }

  const folder = options.folder || "circuit_uploads";
  const resourceType = options.resourceType || options.resource_type || "auto";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload_stream failure:", {
            message: error.message,
            http_code: error.http_code,
            folder,
            resourceType
          });
          reject(error);
        } else {
          logger.info(`Cloudinary upload success: ${result.secure_url}`);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

/**
 * Upload a Multer file object (supporting both memoryStorage and diskStorage)
 * @param {Object} file - Multer file object
 * @param {Object} options - Custom upload options
 * @returns {Promise<Object>} Normalized upload result
 */
const uploadFile = async (file, options = {}) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const sanitizedName = sanitizeFilename(file.originalname);
  const isImage = file.mimetype && file.mimetype.startsWith("image/");
  const isVideo = file.mimetype && file.mimetype.startsWith("video/");
  
  // Choose optimal resource_type
  let resourceType = options.resourceType || options.resource_type || "auto";
  if (isImage) {
    resourceType = "image";
  } else if (isVideo) {
    resourceType = "video";
  } else {
    // Documents (PDF, DOCX, TXT, CSV, ZIP, etc.) -> auto
    resourceType = "auto";
  }

  const uploadOpts = {
    folder: options.folder || "circuit_uploads",
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    ...options,
  };

  if (file.buffer) {
    const res = await uploadBuffer(file.buffer, uploadOpts);
    return {
      url: res.secure_url || res.url,
      secure_url: res.secure_url,
      publicId: res.public_id,
      format: res.format,
      resourceType: res.resource_type,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  if (file.path) {
    const { uploadOnCloudinary } = require("../config/cloudinary");
    const res = await uploadOnCloudinary(file.path);
    if (!res) throw new Error("Cloudinary file upload failed");
    return {
      url: res.secure_url || res.url,
      secure_url: res.secure_url,
      publicId: res.public_id,
      format: res.format,
      resourceType: res.resource_type,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  throw new Error("Unsupported file storage format (missing buffer and path)");
};

/**
 * Upload multiple Multer files in parallel
 * @param {Array<Object>} files - Array of Multer file objects
 * @param {Object} options - Upload options
 * @returns {Promise<Array<Object>>} Array of normalized upload results
 */
const uploadMultipleFiles = async (files = [], options = {}) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  return Promise.all(files.map((file) => uploadFile(file, options)));
};

module.exports = {
  uploadBuffer,
  uploadFile,
  uploadMultipleFiles,
  sanitizeFilename,
};
