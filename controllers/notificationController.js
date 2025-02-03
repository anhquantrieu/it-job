const Notification = require('../models/Notification');
const User = require('../models/User');


const getNotificationByRecruiter = async (req, res) => {
    try {
        const recruiterId = req.user.userId;
        const notifications = await Notification.find({ recruiterId })
        .populate({
            path: 'submissionId',
            populate: {
              path: 'jobPostId',
            }
          })
        .sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({
            recruiterId,
            isReadByRecruiter: false,
          });
        return res.status(200).json({
          success: true,
          data: {
            notifications,
            unreadCount,
          },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lấy thông báo thất bại',
            error: error.message,
          });
    }
}

const getNotificationByUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await Notification.find({ userId, status: { $ne: 'pending' },})
        .populate({
            path: 'submissionId',
            populate: [
              { path: 'jobPostId' },
              { path: 'receivedBy' }
            ]
          })
        .sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({
            userId,
            isReadByUser: false,
            status: { $ne: 'pending' },
          });
        return res.status(200).json({
          success: true,
          data: {
            notifications,
            unreadCount,
          },
        });        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lấy thông báo thất bại',
            error: error.message,
          });
    }
}

const cvResponse = async (req, res) => {
    try {
        const status = req.body.status;
        const userId = req.body.userId
        const submissionId = req.params.submissionId;
        const notification = await Notification.findOneAndUpdate(
          { submissionId },
          { status,  responseTime: new Date(), isReadByUser: false },
          { new: true }
        ).populate({
          path: 'submissionId',
          populate: {
            path: 'receivedBy',
          },
        });

        if (!notification) {
           return res.status(404).json({
             success: false,
             message: 'Không tìm thấy thông báo',
           })
        }
        const unreadCount = await Notification.countDocuments({
          isReadByUser: false,
          userId
          })
        if (global.io && global.io.onlineUsers.has(userId)) {
      
          global.io.onlineUsers.get(userId).forEach((socketId) => {
            io.to(socketId).emit('cvResponseNotification', notification);
          });
          console.log(`Notification sent to user: ${userId}`);
        } else {
          console.warn('User is not online');
        }

        return res.status(200).json({
            success: true,
            data: {
              notification,
              unreadCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lấy thông báo thất bại',
            error: error.message,
          });
    }
}
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const id = req.user.userId;
        const existingUser = await User.findById(id);
        if(existingUser &&existingUser.role === "recruiter") {
          const updatedNotifications = await Notification.updateMany(
            { recruiterId: id },
            { $set: { isReadByRecruiter: true } }
          );
        return res.status(200).json({
            success: true,
            message: 'Tất cả thông báo đã được đánh dấu là đã đọc',
            data: updatedNotifications,
          });
        } else {
          const updatedNotifications = await Notification.updateMany(
            { userId: id },
            { $set: { isReadByUser: true } }
          );
          return res.status(200).json({
            success: true,
            message: 'Tất cả thông báo đã được đánh dấu là đã đọc',
            data: updatedNotifications,
          });
        }
       
    } catch (error) {    
        return res.status(500).json({
            success: false,
            message: 'Cập nhật trạng thái thất bại',
            error: error.message,
          });
    }
}

const toggleNotificationAsRead = async (req, res) => {
    try {
      const id = req.user.userId;
        const notificationId = req.params.notificationId;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy thông báo',
          });
        }

        const existingUser = await User.findById(id);
        if(existingUser && existingUser.role === "recruiter") {
          const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { $set: { isReadByRecruiter: !notification.isReadByRecruiter } },
            { new: true }
          );
          return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thông báo thành công',
            data: updatedNotification,
          });
        } else {
          const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            { $set: { isReadByUser: !notification.isReadByUser } },
            { new: true }
          );
          return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: updatedNotification,
          });
        }
        
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Cập nhật trạng thái thất bại',
          error: error.message,
        });
      }
}

const getNotificationBySubmissionId = async (req, res) => {
    try {
        const submissionId = req.params.submissionId;
        const notification = await Notification.findOne({ submissionId });
        if (!notification) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy thông báo',
          });
        }
        return res.status(200).json({
          success: true,
          data: notification,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Lấy thông báo thất bại',
          error: error.message,
        });
      }
}

module.exports = {
    getNotificationByRecruiter,
    getNotificationByUser,
    markAllNotificationsAsRead,
    cvResponse,
    toggleNotificationAsRead,
    getNotificationBySubmissionId
};