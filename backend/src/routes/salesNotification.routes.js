const express = require('express');
const router = express.Router({ mergeParams: true });
const notificationController = require('../controllers/salesNotification.controller');
const auth = require('../middlewares/auth.middleware');
const tenant = require('../middlewares/tenant.middleware');

router.get('/:slug/notifications', auth, tenant, notificationController.getNotifications);
router.get('/:slug/notifications/unread', auth, tenant, notificationController.getUnreadNotifications);
router.get('/:slug/notifications/stats', auth, tenant, notificationController.getNotificationStats);
router.get('/:slug/notifications/:id', auth, tenant, notificationController.getNotificationById);

router.post('/:slug/notifications/send', auth, tenant, notificationController.sendNotification);

router.put('/:slug/notifications/read-all', auth, tenant, notificationController.markAllAsRead);
router.put('/:slug/notifications/read/:id', auth, tenant, notificationController.markAsRead);

router.delete('/:slug/notifications/:id', auth, tenant, notificationController.deleteNotification);

module.exports = router;