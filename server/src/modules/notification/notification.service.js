const { randomUUID } = require("crypto");
const user_Model = require("../user/user.model");
const notification_Model = require("./notification.model");

const normalizeNotification = (notification = {}) => {
  const createdAt = notification?.createdAt ? new Date(notification.createdAt) : new Date();
  const safeCreatedAt = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;

  return {
    ...notification,
    notific_id: String(notification?.notific_id || randomUUID()),
    createdAt: safeCreatedAt,
  };
};

const dedupeUserIds = (userIds = []) =>
  [...new Set((Array.isArray(userIds) ? userIds : []).map((id) => String(id || "").trim()).filter(Boolean))];

const createNotificationsForUsers = async (userIds = [], notification = {}) => {
  const uniqueUserIds = dedupeUserIds(userIds);

  if (!uniqueUserIds.length) {
    return [];
  }

  const baseNotification = normalizeNotification(notification);
  const rows = uniqueUserIds.map((userId) => ({
    ...baseNotification,
    _id: undefined,
    user_id: userId,
  }));

  return notification_Model.insertMany(rows, { ordered: false });
};

const createNotificationForUser = async (userId, notification = {}) => {
  if (!userId) {
    return null;
  }

  const [saved] = await createNotificationsForUsers([userId], notification);
  return saved || null;
};

const createNotificationForRole = async (role, notification = {}) => {
  const users = await user_Model.find({ role }).select("_id").lean();
  const userIds = users.map((item) => String(item._id));
  return createNotificationsForUsers(userIds, notification);
};

const listNotificationsForUser = async ({ userId, page = 0, limit = 10, skip = 0 } = {}) => {
  const filter = { user_id: String(userId || "") };

  const [items, total] = await Promise.all([
    notification_Model
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    notification_Model.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
  };
};

const clearNotificationsForUser = async (userId) => {
  if (!userId) {
    return;
  }

  await notification_Model.deleteMany({ user_id: String(userId) });
};

const deleteNotificationForUser = async ({ userId, notificId } = {}) => {
  if (!userId || !notificId) {
    return;
  }

  await notification_Model.deleteOne({
    user_id: String(userId),
    notific_id: String(notificId),
  });
};

const countNotificationsForUser = async (userId) => {
  if (!userId) {
    return 0;
  }

  return notification_Model.countDocuments({ user_id: String(userId) });
};

module.exports = {
  clearNotificationsForUser,
  countNotificationsForUser,
  createNotificationForRole,
  createNotificationForUser,
  createNotificationsForUsers,
  deleteNotificationForUser,
  listNotificationsForUser,
};

