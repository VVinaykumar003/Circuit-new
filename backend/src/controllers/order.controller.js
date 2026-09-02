const Order = require("../models/order.model");
const Product = require("../models/Product.model");
const { sendEmailNotification } = require("../utils/notifier");
const mongoose = require("mongoose");
const logger = require("../common/libs/logger");

// ============================================================
// Helper: Get Organization ID
// ============================================================

const getOrganizationId = (req) => {
  return req.organizationId || req.organization || req.tenantId;
};

// ============================================================
// Helper: Generate Order Number
// ============================================================

const generateOrderNumber = async (organizationId) => {
  const year = new Date().getFullYear();

  const count = await Order.countDocuments({
    organization: organizationId,
  });

  return `SO-${year}-${(count + 1).toString().padStart(5, "0")}`;
};

// ============================================================
// Helper: Validate Order Items
// ============================================================

const validateOrderItems = async (items, organizationId) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one product.");
  }

  for (const item of items) {
    if (!item.productId) {
      throw new Error("Product ID is required for every order item.");
    }

    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new Error(`Invalid product ID: ${item.productId}`);
    }

    const product = await Product.findOne({
      _id: item.productId,
      organization: organizationId,
    });

    if (!product) {
      throw new Error(
        `Product not found: ${item.productId}`
      );
    }

    if (product.status !== "Active") {
      throw new Error(
        `Product "${product.productName}" is not active.`
      );
    }

    // Auto-populate snapshot fields from product if missing
    item.productName = item.productName || product.productName;
    item.productCode = item.productCode || product.productCode || product.sku || "PROD";
    item.sku = item.sku || product.sku || "";
    item.productType = item.productType || product.productType || "Other";
    item.unitPrice = Number(item.unitPrice ?? item.sellingPrice ?? item.price ?? product.sellingPrice ?? product.unitPrice ?? 0);
    item.quantity = Number(item.quantity) || 1;
    item.discountPct = Number(item.discountPct ?? item.discount ?? 0);
    item.taxPct = Number(item.taxPct ?? item.tax ?? 0);

    const subtotal = item.unitPrice * item.quantity;
    const discountAmount = subtotal * (item.discountPct / 100);
    const afterDisc = subtotal - discountAmount;
    const taxAmount = afterDisc * (item.taxPct / 100);

    item.lineSubtotal = item.lineSubtotal !== undefined ? Number(item.lineSubtotal) : subtotal;
    item.lineDiscount = item.lineDiscount !== undefined ? Number(item.lineDiscount) : discountAmount;
    item.lineTax = item.lineTax !== undefined ? Number(item.lineTax) : taxAmount;
    item.lineTotal = item.lineTotal !== undefined ? Number(item.lineTotal) : (afterDisc + taxAmount);
  }
};

// ============================================================
// Create New Order
// ============================================================

exports.createOrder = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const orderData = {
      ...req.body,
      organization: organizationId,
    };

    // --------------------------------------------------------
    // Generate Order Number
    // --------------------------------------------------------

    if (!orderData.orderNumber) {
      orderData.orderNumber =
        await generateOrderNumber(organizationId);
    }

    // --------------------------------------------------------
    // Validate Customer ID
    // --------------------------------------------------------

    if (
      orderData.customerId &&
      !mongoose.Types.ObjectId.isValid(orderData.customerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // --------------------------------------------------------
    // Validate Order Items
    // --------------------------------------------------------

    await validateOrderItems(
      orderData.items,
      organizationId
    );

    // --------------------------------------------------------
    // Remove Physical Product Fields
    // --------------------------------------------------------

    delete orderData.tenantId;
    delete orderData.deliveryDate;
    delete orderData.shippingAddress;
    delete orderData.sameAsBilling;
    delete orderData.shippingCharges;
    delete orderData.deliveryMethod;
    delete orderData.trackingNumber;
    delete orderData.expectedDeliveryDate;
    delete orderData.deliveryStatus;

    // --------------------------------------------------------
    // Create Order
    // --------------------------------------------------------

    const order = new Order(orderData);

    await order.save();

    // --------------------------------------------------------
    // Populate Product References
    // --------------------------------------------------------

    await order.populate(
      "items.productId",
      "productName productCode productType version"
    );

    res.status(201).json({
      success: true,
      data: order,
      message: "Software order created successfully.",
    });
  } catch (error) {
    console.error(
      "Error creating software order:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create software order.",
    });
  }
};

// ============================================================
// Get All Orders
// ============================================================

exports.getAllOrders = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    const orders = await Order.find({
      organization: organizationId,
    })
      // .populate(
      //   "customerId",
      //   "customerName email phone"
      // )
      .populate(
        "items.productId",
        "productName productCode productType version"
      )
      .sort({
        createdAt: -1,
      });

    // --------------------------------------------------------
    // Frontend Compatibility Mapping
    // --------------------------------------------------------

    const mappedOrders = orders.map((order) => {
      const orderObj = order.toObject();

      orderObj.id = orderObj._id;

      // Keep frontend aliases if your existing UI uses them
      orderObj.orderValue = orderObj.grandTotal;
      orderObj.orderStatus = orderObj.status;
      orderObj.salesRep = orderObj.salesOwner;

      orderObj.notes = {
        internal: orderObj.internalNotes || "",
        customer: orderObj.customerNotes || "",
      };

      return orderObj;
    });

    res.status(200).json({
      success: true,
      data: mappedOrders,
    });
  } catch (error) {
    console.error(
      "Error fetching software orders:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};

// ============================================================
// Get Single Order
// ============================================================

exports.getOrderById = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      organization: organizationId,
    })
      .populate(
        "customerId",
        "name email phone"
      )
      .populate(
        "items.productId",
        "productName productCode productType version"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const orderObj = order.toObject();

    orderObj.id = orderObj._id;
    orderObj.orderValue = orderObj.grandTotal;
    orderObj.orderStatus = orderObj.status;
    orderObj.salesRep = orderObj.salesOwner;

    orderObj.notes = {
      internal: orderObj.internalNotes || "",
      customer: orderObj.customerNotes || "",
    };

    res.status(200).json({
      success: true,
      data: orderObj,
    });
  } catch (error) {
    console.error(
      "Error fetching software order:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch order.",
    });
  }
};

// ============================================================
// Update Order
// ============================================================

exports.updateOrder = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const orderId = req.params.id;

    // --------------------------------------------------------
    // Validate Organization
    // --------------------------------------------------------

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    // --------------------------------------------------------
    // Validate Order ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    logger.info(`Attempting to update software order: ${orderId}`, {
      organizationId,
    });

    // --------------------------------------------------------
    // Clone Request Body
    // --------------------------------------------------------

    const updateData = {
      ...req.body,
    };

    // --------------------------------------------------------
    // FRONTEND COMPATIBILITY ALIASES
    // --------------------------------------------------------
    // GET response currently exposes:
    //
    // orderStatus -> status
    // salesRep    -> salesOwner
    // orderValue  -> grandTotal
    // notes       -> internalNotes/customerNotes
    //
    // Convert these aliases before updating MongoDB.
    // --------------------------------------------------------

    if (updateData.orderStatus !== undefined) {
      updateData.status = updateData.orderStatus;

      delete updateData.orderStatus;
    }

    if (updateData.salesRep !== undefined) {
      updateData.salesOwner = updateData.salesRep;

      delete updateData.salesRep;
    }

    if (updateData.orderValue !== undefined) {
      updateData.grandTotal = updateData.orderValue;

      delete updateData.orderValue;
    }

    // --------------------------------------------------------
    // NOTES COMPATIBILITY
    // --------------------------------------------------------

    if (updateData.notes) {
      if (
        updateData.notes.internal !== undefined &&
        updateData.internalNotes === undefined
      ) {
        updateData.internalNotes = updateData.notes.internal;
      }

      if (
        updateData.notes.customer !== undefined &&
        updateData.customerNotes === undefined
      ) {
        updateData.customerNotes = updateData.notes.customer;
      }

      delete updateData.notes;
    }

    // --------------------------------------------------------
    // PREVENT ORGANIZATION / TENANT MANIPULATION
    // --------------------------------------------------------

    delete updateData.organization;
    delete updateData.organizationId;
    delete updateData.tenantId;

    // --------------------------------------------------------
    // PREVENT IMMUTABLE FIELD CHANGES
    // --------------------------------------------------------

    delete updateData._id;
    delete updateData.id;
    delete updateData.__v;

    delete updateData.orderNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // --------------------------------------------------------
    // REMOVE OLD PHYSICAL PRODUCT FIELDS
    // --------------------------------------------------------

    delete updateData.deliveryDate;
    delete updateData.expectedDeliveryDate;
    delete updateData.shippingAddress;
    delete updateData.sameAsBilling;
    delete updateData.shippingCharges;
    delete updateData.deliveryMethod;
    delete updateData.trackingNumber;
    delete updateData.deliveryStatus;

    // --------------------------------------------------------
    // REMOVE OLD PRODUCT / INVENTORY FIELDS
    // --------------------------------------------------------

    delete updateData.products;
    delete updateData.stockQuantity;
    delete updateData.stockStatus;
    delete updateData.warehouse;
    delete updateData.uom;

    // --------------------------------------------------------
    // VALIDATE SOFTWARE ORDER ITEMS
    // --------------------------------------------------------

  if (updateData.items !== undefined) {
  if (!Array.isArray(updateData.items)) {
    return res.status(400).json({
      success: false,
      message: "Order items must be an array.",
    });
  }

  if (updateData.items.length === 0) {
    return res.status(400).json({
      success: false,
      message:
        "At least one software product is required.",
    });
  }

  // ------------------------------------------------------
  // Normalize populated productId
  // ------------------------------------------------------
  //
  // GET order can return:
  //
  // productId: {
  //   _id: "...",
  //   productName: "...",
  //   ...
  // }
  //
  // But database validation requires:
  //
  // productId: "..."
  //
  // ------------------------------------------------------

  updateData.items = updateData.items.map((item) => {
    const normalizedItem = {
      ...item,
    };

    if (
      normalizedItem.productId &&
      typeof normalizedItem.productId === "object"
    ) {
      normalizedItem.productId =
        normalizedItem.productId._id ||
        normalizedItem.productId.id;
    }

    return normalizedItem;
  });

  await validateOrderItems(
    updateData.items,
    organizationId
  );
}

    // --------------------------------------------------------
    // VALIDATE STATUS
    // --------------------------------------------------------

    const allowedStatuses = [
      "Draft",
      "Pending",
      "Pending Approval",
      "Approved",
      "Processing",
      "Awaiting Payment",
      "Completed",
      "Cancelled",
      "On Hold",
      "Unpaid",
      "Partially Paid",
      "Paid",
      "Refunded",
      "Partially Refunded",
    ];

    if (
      updateData.status !== undefined &&
      !allowedStatuses.includes(updateData.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status: ${updateData.status}`,
      });
    }

    // --------------------------------------------------------
    // VALIDATE PRIORITY
    // --------------------------------------------------------

    const allowedPriorities = [
      "Low",
      "Medium",
      "High",
      "Urgent",
    ];

    if (
      updateData.priority !== undefined &&
      !allowedPriorities.includes(updateData.priority)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority: ${updateData.priority}`,
      });
    }

    // --------------------------------------------------------
    // VALIDATE PAYMENT STATUS
    // --------------------------------------------------------

    const allowedPaymentStatuses = [
      "Unpaid",
      "Partially Paid",
      "Paid",
      "Refunded",
      "Partially Refunded",
    ];

    if (
      updateData.paymentStatus !== undefined &&
      !allowedPaymentStatuses.includes(
        updateData.paymentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status: ${updateData.paymentStatus}`,
      });
    }

    // --------------------------------------------------------
    // VALIDATE PROVISIONING STATUS
    // --------------------------------------------------------

    const allowedProvisioningStatuses = [
      "Pending",
      "Processing",
      "Provisioned",
      "Failed",
    ];

    if (
      updateData.provisioningStatus !== undefined &&
      !allowedProvisioningStatuses.includes(
        updateData.provisioningStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid provisioning status: ${updateData.provisioningStatus}`,
      });
    }

    // --------------------------------------------------------
    // VALIDATE DELIVERY TYPE
    // --------------------------------------------------------

    const allowedDeliveryTypes = [
      "Instant Download",
      "Email",
      "License Key",
      "Domain Activation",
      "Manual Activation",
      "Account Provisioning",
    ];

    if (
      updateData.deliveryType !== undefined &&
      !allowedDeliveryTypes.includes(
        updateData.deliveryType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery type: ${updateData.deliveryType}`,
      });
    }

    // --------------------------------------------------------
    // VALIDATE PAYMENT METHOD
    // --------------------------------------------------------

    const allowedPaymentMethods = [
      "Cash",
      "Card",
      "Credit Card",
      "UPI",
      "Bank Transfer",
      "Cheque",
      "Online",
      "Other",
    ];

    if (
      updateData.paymentMethod !== undefined &&
      !allowedPaymentMethods.includes(
        updateData.paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method: ${updateData.paymentMethod}`,
      });
    }

    if (updateData.items && Array.isArray(updateData.items)) {
      await validateOrderItems(updateData.items, organizationId);
    }

    // --------------------------------------------------------
    // PREVENT CLIENT FROM MANUALLY CHANGING PROVISIONED DATE
    // --------------------------------------------------------

    delete updateData.provisionedAt;

    // --------------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------------

    const existingOrder = await Order.findOne({
      _id: orderId,
      organization: organizationId,
    });

    if (!existingOrder) {
      logger.warn("Update failed: Order not found", {
        orderId,
        organizationId,
      });

      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // --------------------------------------------------------
    // HANDLE PROVISIONING DATE
    // --------------------------------------------------------
    // When provisioningStatus becomes Provisioned,
    // automatically set provisionedAt.
    // --------------------------------------------------------

    if (
      updateData.provisioningStatus ===
      "Provisioned"
    ) {
      updateData.provisionedAt = new Date();
    }

    // --------------------------------------------------------
    // UPDATE ORDER
    // --------------------------------------------------------

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        organization: organizationId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate(
      "items.productId",
      "productName productCode productType version"
    );

    logger.info(`order : ${order}`);

    // --------------------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------------------

    if (!order) {
      logger.warn(
        "Update failed after validation: Order not found",
        {
          orderId,
          organizationId,
        }
      );

      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // --------------------------------------------------------
    // LOG SUCCESS
    // --------------------------------------------------------

    logger.info(
      `Software order updated successfully: ${orderId}`,
      {
        organizationId,
      }
    );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      data: order,
      message: "Software order updated successfully.",
    });
  } catch (error) {
    logger.error(
      "Error updating software order:",
      {
        orderId: req.params.id,
        error: error.message,
        stack: error.stack,
      }
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update software order.",
    });
  }
};

// ============================================================
// Delete Order
// ============================================================

exports.deleteOrder = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const orderId = req.params.id;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOneAndDelete({
      _id: orderId,
      organization: organizationId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Error deleting software order:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete order.",
    });
  }
};

// ============================================================
// Email Customer
// ============================================================

exports.emailCustomer = async (req, res) => {
  try {
    const organizationId = getOrganizationId(req);
    const orderId = req.params.id;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      organization: organizationId,
    }).populate(
      "items.productId",
      "productName productCode productType version"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!order.email) {
      return res.status(400).json({
        success: false,
        message:
          "Customer email not found for this order.",
      });
    }

    // --------------------------------------------------------
    // Prepare Purchased Software
    // --------------------------------------------------------

    const productsHtml = order.items
      .map((item) => {
        return `
          <li>
            <strong>${item.productName}</strong>
            ${item.planName
              ? ` - ${item.planName}`
              : ""}
            ${item.billingCycle
              ? ` (${item.billingCycle})`
              : ""}
            - ₹${item.lineTotal.toLocaleString()}
          </li>
        `;
      })
      .join("");

    // --------------------------------------------------------
    // Email
    // --------------------------------------------------------

    const emailHtml = `
      <h3>
        Software Order Update:
        ${order.orderNumber}
      </h3>

      <p>
        Dear
        ${order.contactPerson || order.customerName},
      </p>

      <p>
        This is an update regarding your
        software order
        <strong>${order.orderNumber}</strong>.
      </p>

      <p>
        <strong>Status:</strong>
        ${order.status}
      </p>

      <p>
        <strong>Payment Status:</strong>
        ${order.paymentStatus}
      </p>

      <p>
        <strong>Provisioning Status:</strong>
        ${order.provisioningStatus}
      </p>

      <p>
        <strong>Order Value:</strong>
        ₹${order.grandTotal.toLocaleString()}
      </p>

      <h4>
        Purchased Software
      </h4>

      <ul>
        ${productsHtml}
      </ul>

      ${
        order.deliveryType
          ? `
            <p>
              <strong>Delivery Type:</strong>
              ${order.deliveryType}
            </p>
          `
          : ""
      }

      ${
        order.customerNotes
          ? `
            <p>
              <strong>Notes:</strong>
              ${order.customerNotes}
            </p>
          `
          : ""
      }

      <br />

      <p>
        Thank you for your business!
      </p>
    `;

    await sendEmailNotification(
      order.email,
      `Update on Software Order: ${order.orderNumber}`,
      emailHtml
    );

    res.status(200).json({
      success: true,
      message:
        "Software order email sent successfully to " +
        order.email,
    });
  } catch (error) {
    console.error(
      "Error sending software order email:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to send email.",
    });
  }
};