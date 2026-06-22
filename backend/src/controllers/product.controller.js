const Product = require("../models/Product.model");
const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * @desc    Create a new product
 * @route   POST /api/:slug/products
 */
exports.createProduct = async (req, res) => {
  try {
    const { openingStock, ...productData } = req.body;
    
    // Evaluate initial stock status
    let stockStatus = "Out Of Stock";
    const currentStock = openingStock || 0;
    if (currentStock > (productData.reorderLevel || 0)) {
      stockStatus = "In Stock";
    } else if (currentStock > 0) {
      stockStatus = "Low Stock";
    }

    // Handle Cloudinary File Uploads
    const imageUrls = [];
    const documentUrls = [];
    
    let files = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === 'object') {
      files = Object.values(req.files).flat();
    }

    for (const file of files) {
      const isImage = file.fieldname === 'images';
      const folder = isImage ? "products/images" : "products/documents";
      const resourceType = isImage ? "image" : "auto"; // "auto" lets cloudinary figure out raw/pdf formats
      
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      if (isImage) imageUrls.push(result.secure_url);
      else documentUrls.push(result.secure_url);
    }
    console.log(imageUrls);

    const newProduct = new Product({
      ...productData,
      images: imageUrls,
      imageUrl: imageUrls.length > 0 ? imageUrls[0] : (productData.imageUrl || undefined),
      documents: documentUrls,
      stockQuantity: currentStock,
      stockStatus,
      organization: req.organization._id,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all products for the organization
 * @route   GET /api/:slug/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { status, category, brand, search } = req.query;
    
    // Build query based on tenant and optional filters
    const query = { organization: req.organization._id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productCode: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/:slug/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/:slug/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const updateFields = { ...req.body };
    
    // Remove arrays from $set to avoid MongoDB conflict with $push operations below
    delete updateFields.images;
    delete updateFields.documents;

    // Handle Cloudinary File Uploads for Updates
    const imageUrls = [];
    const documentUrls = [];
    
    let files = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === 'object') {
      files = Object.values(req.files).flat();
    }

    if (files.length > 0) {
      for (const file of files) {
        const isImage = file.fieldname === 'images';
        const folder = isImage ? "products/images" : "products/documents";
        const resourceType = isImage ? "image" : "auto";
        
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        if (isImage) imageUrls.push(result.secure_url);
        else documentUrls.push(result.secure_url);
      }
    }

    const updateQuery = { $set: updateFields };
    
    // Append new uploaded files to the existing arrays in the database
    if (imageUrls.length > 0 || documentUrls.length > 0) {
      updateQuery.$push = updateQuery.$push || {};
      if (imageUrls.length > 0) {
        updateQuery.$push.images = { $each: imageUrls };
        updateQuery.$set.imageUrl = imageUrls[0]; // Set the first new image as the main imageUrl
      }
      if (documentUrls.length > 0) {
        updateQuery.$push.documents = { $each: documentUrls };
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/:slug/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
