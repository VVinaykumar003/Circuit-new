const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const { upload } = require("../middlewares/upload");
const productController = require("../controllers/product.controller");

// All product routes require authentication and a valid tenant slug

// Create a new product
router.post("/:slug/create-products", auth, tenant, upload.any(), productController.createProduct);

// Get all products (with optional search/filtering)
router.get("/:slug/get-products", auth, tenant, productController.getAllProducts);

// Get, Update, or Delete a specific product
router.route("/:slug/get-products/:id")
  .get(auth, tenant, productController.getProductById)
  .put(auth, tenant, upload.any(), productController.updateProduct)
  .delete(auth, tenant, productController.deleteProduct);

module.exports = router;
