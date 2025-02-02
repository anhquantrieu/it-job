const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp conversationId",
      });
    }
    const messages = await Message.find({ conversationId })
      .populate("senderId")
      .sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      message: "Lấy tin nhắn thành công",
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy tin nhắn thất bại",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.userId;

    // Kiểm tra nếu conversation tồn tại
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation không tồn tại",
      });
    }

    // Lưu tin nhắn vào database
    const newMessage = await Message.create({
      conversationId,
      senderId,
      content,
    });

    // Emit tin nhắn tới những người trong conversation qua Socket.IO
    const messageData = await Message.findById(newMessage._id).populate(
      "senderId"
    );
    if (global.io) {
      global.io.to(conversationId).emit("newMessage", messageData);
    }

    return res.status(201).json({
      success: true,
      message: "Tin nhắn đã được gửi",
      data: messageData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gửi tin nhắn thất bại",
      error: error.message,
    });
  }
};

const getCandidates = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Lấy danh sách ứng viên duy nhất đã từng gửi tin nhắn
    const candidates = await Message.aggregate([
      { $match: { senderId: { $ne: new mongoose.Types.ObjectId(userId) } } }, // Bỏ recruiter
      { $group: { _id: "$senderId" } }, // Chỉ lấy senderId duy nhất
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "senderInfo" } }, // Lấy thông tin ứng viên
      { $unwind: "$senderInfo" }, // Gỡ mảng senderInfo thành object
      { $sort: { "senderInfo.fullName": 1 } } // Sắp xếp theo tên ứng viên
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ứng viên thành công",
      data: candidates.map(c => c.senderInfo),
    });
  } catch (error) {
    console.log("Lỗi khi lấy danh sách ứng viên:", error);
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách ứng viên thất bại",
      error: error.message,
    });
  }
};


module.exports = { getMessages, sendMessage, getCandidates };
