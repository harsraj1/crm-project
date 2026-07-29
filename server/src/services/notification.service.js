import { Notification } from '../models/Notification.js';

export const createNotification = async (data) => {
  const { userId, type, title, message, relatedId, relatedType, priority = 'medium' } = data;

  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority,
      read: false
    });

    console.log(`🔔 Notification created for user: ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Notification creation failed:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const query = { user: userId };
  if (unreadOnly) query.read = false;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    notifications,
    total,
    page,
    pages: Math.ceil(total / limit),
    unreadCount: await Notification.countDocuments({ user: userId, read: false })
  };
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany({ user: userId, read: false }, { read: true });
};

export const createSystemNotification = async (userId, title, message, relatedData = {}) => {
  return createNotification({ userId, type: 'system', title, message, ...relatedData });
};

export const createLeadNotification = async (userId, leadId, action) => {
  const messages = {
    created: 'New lead assigned to you',
    updated: 'Lead status updated',
    assigned: 'Lead assigned to you',
    won: 'Lead closed as Won - Congratulations!'
  };

  return createNotification({
    userId,
    type: 'lead',
    title: 'Lead Update',
    message: messages[action] || 'Lead updated',
    relatedId: leadId,
    relatedType: 'Lead'
  });
};