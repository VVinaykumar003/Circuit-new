const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const orderController = require("../controllers/order.controller");

// All order routes require authentication and a valid tenant slug

// Create a new order
router.post("/:slug/create-order", auth, tenant, orderController.createOrder);

// Get all orders
router.get("/:slug/get-all-orders", auth, tenant, orderController.getAllOrders);

// Send email for a specific order
router.post("/:slug/get-orders/:id/email", auth, tenant, orderController.emailCustomer);

// Get, Update, or Delete a specific order
router.route("/:slug/get-orders/:id")
  .get(auth, tenant, orderController.getOrderById)
  .put(auth, tenant, orderController.updateOrder)
  .delete(auth, tenant, orderController.deleteOrder);

module.exports = router;