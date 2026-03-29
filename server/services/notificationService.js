import Notification from '../models/Notification.js';

// In-memory store for Socket.IO instance
let io = null;

export const setIO = (socketIO) => {
  io = socketIO;
};

export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);

    // Emit real-time notification if socket is available
    if (io) {
      io.to(`user_${data.user}`).emit('notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        isRead: false,
        actionUrl: notification.actionUrl,
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
};

export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedItem', 'title type'),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    pages: Math.ceil(total / limit),
  };
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};
