const CVSubmission = require("../models/CVSubmission");
const JobPost = require("../models/JobPost");
const User = require("../models/User");
const Notification = require('../models/Notification');
const uploadFile = require("../utils/upload");

const submitCV = async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.body.jobPostId);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Bài tuyển dụng không tồn tại",
      });
    }

    if (new Date() > new Date(jobPost.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Đã quá hạn nộp hồ sơ",
      });
    }

    let submissionData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    // Kiểm tra nếu có file đính kèm
    if (req.file) {
      const result = await uploadFile(req.file);
      submissionData.cvInfo = {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
      };
    }

    const submission = await CVSubmission.create(submissionData);

    const message = `Bạn có một CV mới từ ứng viên ${req.body.fullName} cho công việc ${jobPost.title}`;
    const notification = await Notification.create({
      userId: submission.createdBy,
      recruiterId: submission.receivedBy,
      message,
      submissionId: submission._id,
    });
    const notificationDetail = await Notification.findById(notification._id).populate({
      path: 'submissionId',
      populate: {
        path: 'jobPostId',
      }
    })
    const recruiterId = jobPost.createdBy.toString();
    console.log("recruiterId", recruiterId);
    if (global.io && global.io.onlineUsers.has(recruiterId)) {
      
      global.io.onlineUsers.get(recruiterId).forEach((socketId) => {
        io.to(socketId).emit('newCV', notificationDetail);
      });
      console.log(`Notification sent to recruiter: ${recruiterId}`);
    } else {
      console.warn('Recruiter is not online');
    }

    return res.status(201).json({
      success: true,
      message: "Nộp CV thành công",
      data: submission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Nộp CV thất bại",
      error: error.message,
    });
  }
};


const updateSubmitCV = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubmission = await CVSubmission.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      success: true,
      message: "Cập nhật CV thành công",
      data: updatedSubmission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cập nhật CV thất bại",
      error: error.message,
    });
  }
};

const getCVSubmissions = async (req, res) => {
  try {
    const submissions = await CVSubmission.find();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách CV thành công",
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách CV thất bại",
      error: error.message,
    });
  }
};

const getCVLatest = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin createdBy",
      });
    }

    // Tìm tất cả các CV với `receivedBy`
    const submissions = await CVSubmission.findOne({ createdBy })
      .populate("jobPostId")
      .sort({ createdAt: -1 })
      .limit(1);

    if (!submissions) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy CV gần đây",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy CV gần nhất thành công",
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy CV gần nhất thất bại",
      error: error.message,
    });
  }
};

const getCVByUser = async (req, res) => {
  try {
    const createdBy = req.user.userId;

    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin createdBy",
      });
    }

    // Tìm tất cả các CV với `receivedBy`
    const submissions = await CVSubmission.find({ createdBy })
    .populate({
      path: 'jobPostId',
      populate: {
        path: 'createdBy',
      }
    })
    .populate({
      path: 'createdBy',
      
    })
    .sort({ createdAt: -1 })
      .exec();
    if (!submissions) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy CV",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách CV thành công",
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách CV thất bại",
      error: error.message,
    });
  }
};

const getCVByCruiter = async (req, res) => {
  const page = Number.isNaN(parseInt(req.query.page)) || parseInt(req.query.page) <= 0 ? 1 : parseInt(req.query.page);
  const limit = Number.isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) <= 0 ? 10 : parseInt(req.query.limit);
  const skip = (page - 1) * limit;

  try {
    const receivedBy = req.user?.userId;

    if (!receivedBy) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin receivedBy",
      });
    }

    const user = await User.findById(receivedBy);
    if (!user || user.role !== "recruiter") {
      return res.status(400).json({
        success: false,
        message: "Người dùng không phải là nhà tuyển dụng",
      });
    }

    const filter = { receivedBy };

    const submissions = await CVSubmission.find(filter)
      .populate({
        path: 'jobPostId',
        populate: { path: 'createdBy' },
      })
      .populate('createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy CV",
      });
    }

    const total = await CVSubmission.countDocuments(filter);

    const submissionsWithStatus = await Promise.all(
      submissions.map(async (submission) => {
        try {
          const notification = await Notification.findOne({
            submissionId: submission._id,
          }).select('status');

          return {
            ...submission.toObject(),
            status: notification ? notification.status : null,
          };
        } catch (err) {
          console.error('Lỗi khi lấy thông báo:', err);
          return {
            ...submission.toObject(),
            status: null,
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách CV thành công",
      data: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubmissions: total,
        submissions: submissionsWithStatus,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách CV thất bại",
      error: error.message,
    });
  }
};


const checkAndGetLatestSubmission = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin createdBy",
      });
    }

    const jobPostId = req.params.id;
    
    if(!jobPostId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin jobPostId",
      });
    }

    // Tìm tất cả các CV với `receivedBy`
    const submissions = await CVSubmission.findOne({ createdBy, jobPostId })
      .populate("jobPostId")
      .sort({ createdAt: -1 })
      .exec();
    if (!submissions) {
      return res.status(404).json({
        success: false,
        message: "Chưa ứng tuyển",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lấy CV gần nhất thành công",
      data: submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy CV gần nhất thất bại",
      error: error.message,
    });
  }
};

const getRecruiterSubmissions = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin createdBy",
      });
    }

    const submissions = await CVSubmission.find({ createdBy })
      .populate("receivedBy")
      .sort({ createdAt: -1 })
      .exec();
    if (!submissions) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin nhà tuyển dụng",
      });
    }
    const uniqueRecruiters = [];
    const seenRecruiters = new Set();

    submissions.forEach((submission) => {
      const recruiterId = submission.receivedBy?._id.toString();
      if (!seenRecruiters.has(recruiterId)) {
        seenRecruiters.add(recruiterId);
        uniqueRecruiters.push(submission.receivedBy);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà tuyển dụng thành công",
      data: uniqueRecruiters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách nhà tuyển dụng thất bại",
      error: error.message,
    });
  }
};

const getApplicantSubmissions = async (req, res) => {
  try {
    const receivedBy = req.user.userId;
    if (!receivedBy) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin receivedBy",
      });
    }

    const submissions = await CVSubmission.find({ receivedBy })
      .populate("createdBy")
      .sort({ createdAt: -1 })
      .exec();
    if (!submissions) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin ứng viên",
      });
    }
    const uniqueApplicants = [];
    const seenApplicants = new Set();

    submissions.forEach((submission) => {
      const applicantId = submission.createdBy?._id.toString();
      if (!seenApplicants.has(applicantId)) {
        seenApplicants.add(applicantId);
        uniqueApplicants.push(submission.createdBy);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ứng viên thành công",
      data: uniqueApplicants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách ứng viên thất bại",
      error: error.message,
    });
  }
};

module.exports = { submitCV, getCVSubmissions, getCVLatest, getCVByUser, updateSubmitCV, checkAndGetLatestSubmission, getCVByCruiter, getRecruiterSubmissions, getApplicantSubmissions };
