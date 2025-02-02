const Conversation = require("../models/Conversation");

const createConversation = async (req, res) => {
    

  try {
    const  { employerId }  = req.body;
    const applicantId = req.user.userId;

    // Kiểm tra thông tin đầu vào
    if (!employerId || !applicantId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp employerId và applicantId",
      });
    }
    let conversation = await Conversation.findOne({ employerId, applicantId });
    if (!conversation) {
      conversation = await Conversation.create({ employerId, applicantId });
    }

    return res.status(200).json({
        success: true,
        message: "Tạo hoặc lấy cuộc trò chuyện thành công",
        data: conversation,
      });
  } catch (err) {
    return res.status(500).json({
        success: false,
        message: "Tạo cuộc trò chuyện thất bại",
        error: error.message,
      });
  }
};

const getConversations = async (req, res) => {
    try {
      const  userId  = req.user.userId;
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp userId",
        });
      }
  
      const conversations = await Conversation.find({
        $or: [{ employerId: userId }, { applicantId: userId }],
      })
        .populate("employerId", "fullName email")
        .populate("applicantId", "fullName email")
        .sort({ createdAt: -1 });
  
      return res.status(200).json({
        success: true,
        message: "Lấy danh sách cuộc trò chuyện thành công",
        data: conversations,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lấy danh sách cuộc trò chuyện thất bại",
        error: error.message,
      });
    }
  };

const getConversationById = async (req, res) => {
    try {
      const { conversationId } = req.params;
  
      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp conversationId",
        });  
      }
  
      const conversation = await Conversation.findById(conversationId).populate("employerId");
  
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cuộc trò chuyện",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Lấy cuộc trò chuyện thành cong",
        data: conversation,
      });
    } catch (error) {    
      return res.status(500).json({
        success: false,
        message: "Lấy cuộc trò chuyện thất bại",
        error: error.message,
      })
      }
  };
  

module.exports = { createConversation, getConversations, getConversationById };