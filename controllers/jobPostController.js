const JobPost = require("../models/JobPost");

// Tạo bài tuyển dụng mới
const createJobPost = async (req, res) => {
  try {
    const newJobPost = new JobPost(req.body);

    const savedJobPost = await newJobPost.save();
    res.status(201).json({
      success: true,
      message: "Tạo bài tuyển dụng thành công",
      data: savedJobPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tạo bài tuyển dụng thất bại",
      error: error.message,
    });
  }
};

// Lấy danh sách bài tuyển dụng
const getAllJobPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const location = req.query.location || "";
    const salary = req.query.salary || "";
    const experience = req.query.experience || "";
    const searchQuery = req.query.searchQuery || "";
    // Tính toán số lượng document cần bỏ qua
    const skip = (page - 1) * limit;

    const filter = {};
    if (location && location !== "Ngẫu nhiên") {
      filter.location = { $regex: location, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }
    if (salary && salary !== "Ngẫu nhiên") {
      filter.salary = { $eq: salary }; // Truy vấn chính xác theo mức lương
    }
    if (experience && experience !== "Ngẫu nhiên") {
      filter.experience = { $eq: experience }; // Truy vấn chính xác theo số năm kinh nghiệm
    }

    if (searchQuery && searchQuery !== "") {
      filter.title = { $regex: searchQuery, $options: "i" };
    }
    const jobPosts = await JobPost.find(filter)
    .populate("createdBy")
    .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await JobPost.countDocuments(filter);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách bài tuyển dụng thành công",
      data: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        jobPosts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lấy danh sách bài tuyển dụng thất bại",
      error: error.message,
    });
  }
};

const getJobPostsRelate = async (req, res) => {
  try {
    const { category, jobPostId } = req.query;
    const limit = parseInt(req.query.limit) || 5;
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin category",
      });
    }
    if (!jobPostId) {
      return res.status(400).json({
        success: false,
        message: "ID bài tuyển dụng không hợp lệ.",
      });
    }

    const filter = {
      category,
      _id: { $ne: jobPostId },
    };

    const jobPosts = await JobPost.find(filter)
      .populate("createdBy")
      .sort({ createdAt: -1 })
      .limit(limit);

    if (!jobPosts) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài tuyển dụng liên quan",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bài tuyển dụng liên quan thành công",
      data: jobPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lấy danh sách bài tuyển dụng liên quan thất bại",
      error: error.message,
    });
  }
};



// Lấy chi tiết bài tuyển dụng theo ID
const getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPost = await JobPost.findById(id).populate("createdBy");

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Bài tuyển dụng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết bài tuyển dụng thành công",
      data: jobPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lấy chi tiết bài tuyển dụng thất bại",
      error: error.message,
    });
  }
};

// Cập nhật bài tuyển dụng
const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    // Cập nhật bài tuyển dụng
    const updatedJobPost = await JobPost.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedJobPost) {
      return res.status(404).json({
        success: false,
        message: "Bài tuyển dụng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật bài tuyển dụng thành công",
      data: updatedJobPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cập nhật bài tuyển dụng thất bại",
      error: error.message,
    });
  }
};

// Xóa bài tuyển dụng
const deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedJobPost = await JobPost.findByIdAndDelete(id);

    if (!deletedJobPost) {
      return res.status(404).json({
        success: false,
        message: "Bài tuyển dụng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa bài tuyển dụng thành công",
      data: deletedJobPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xóa bài tuyển dụng thất bại",
      error: error.message,
    });
  }
};

module.exports = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  getJobPostsRelate,
};
