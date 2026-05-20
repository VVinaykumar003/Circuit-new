const express=require("express");
const router=express.Router();
const auth=require("../middlewares/auth.middleware");
const tenant=require("../middlewares/tenant.middleware");
const notificationController=require("../controllers/notification.controller");
const { upload } = require("../middlewares/upload");
router.post("/:slug/notification",auth,tenant,upload.array("attachments") ,notificationController.sendNotification);
router.get("/:slug/notification",auth,tenant,notificationController.getNotifications);
router.put("/:slug/notification/:id",auth,tenant,upload.array("attachments"), notificationController.updateNotification);
router.delete("/:slug/notification/:id",auth,tenant, notificationController.deleteNotification);
// Add these to your existing router
router.put("/:slug/read-all",auth,tenant, notificationController.markAllAsRead);
router.put("/:slug/:id/read",auth,tenant, notificationController.markAsRead);

module.exports=router;