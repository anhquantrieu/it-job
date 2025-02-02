const User = require("../models/User");
const JobPost = require('../models/JobPost');
const {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const uploadFile = require("../utils/upload");

const register = async (req, res) => {
  const { fullName, email, password, type } = req.body;
  try {
    if (type === "recruiter") {
      const recruiterExists = await User.findOne({ email});
      if (recruiterExists) {
        return res.status(400).json({ message: "Recruiter already exists" });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Logo là bắt buộc. Vui lòng tải lên file logo.",
        });
      }

      const result = await uploadFile(req.file);
      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Lỗi khi upload file logo.",
        });
      }
      const recruiterData = {
        email: req.body.email,
        password: req.body.password,
        companyName: req.body.companyName,
        address: req.body.address,
        description: req.body.description,
        employeeCount: req.body.employeeCount,
        website: req.body.website,
        role: "recruiter",
        logoInfo: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      };

      const recruiter = await User.create(recruiterData);
      if(!recruiter){
        return res.status(400).json({
          success: false,
          message: "Lỗi khi tạo nhà tuyển dụng",
        });
      }
      return res.status(201).json({
        success: true,
        message: "Nhà tuyển dụng đã được tạo thành công",
        data: recruiter,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ fullName, email, password });
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: err});
  }
};

const updateAvatar = async (req, res) => {
  try {
    // Kiểm tra req.user và userId
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.userId;

    // Kiểm tra req.file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar là bắt buộc. Vui lòng tải lên file avatar.",
      });
    }

    // Upload file avatar
    const result = await uploadFile(req.file);
    if (!result || !result.secure_url || !result.public_id) {
      return res.status(400).json({
        success: false,
        message: "Lỗi khi upload file avatar.",
      });
    }

    // Tìm user và kiểm tra sự tồn tại của user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User không tồn tại." 
      });
    }

    if(user.role === "recruiter") {
      user.logoInfo = user.logoInfo ?? {};
      user.logoInfo.url = result.secure_url;
      user.logoInfo.publicId = result.public_id;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Cập nhật logo thành công."
      });
    }

    // Cập nhật avatar cho user
    user.avatarInfo = user.avatarInfo ?? {};
    user.avatarInfo.url = result.secure_url;
    user.avatarInfo.publicId = result.public_id;

    await user.save();
    res.status(200).json({ 
      success: true, 
      message: "Cập nhật avatar thành công." 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi cập nhật avatar.", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updateUser = {
      ...req.body
    };
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
      }
    
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateUser.password = hashedPassword; 
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
    res.status(200).json({ success: true, message: "Cập nhật thống tin người dùng thành công", data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err || "Error logging in user" });
  }
};

const refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Thiếu refresh token" });
  }

  try {
    const payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(payload.userId);

    return res.status(200).json({ accessToken });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token đã hết hạn" });
    }
    return res.status(401).json({ message: "Refresh token không hợp lệ" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("CVSubmissions").populate('jobs');
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống tin người dung",
    });
  }
};

const saveJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // Kiểm tra xem công việc đã có trong danh sách lưu hay chưa
    const jobIndex = user.savedJobs.indexOf(jobId);
    if (jobIndex > -1) {
      // Nếu công việc đã được lưu, xóa khỏi danh sách
      user.savedJobs.splice(jobIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Đã bỏ lưu công việc.' });
    } else {
      // Nếu công việc chưa được lưu, thêm vào danh sách
      user.savedJobs.push(jobId);
      await user.save();
      return res.status(200).json({ message: 'Đã lưu công việc thành công.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate({
      path: 'savedJobs',
      populate: {
        path: 'createdBy',
      }
    });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }
    res.status(200).json({ data: user.savedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getSavedJobIds = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate({
      path: 'savedJobs',
      select: '_id' // Chỉ lấy trường _id của savedJobs
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // Lấy danh sách các _id của savedJobs
    const jobIds = user.savedJobs.map(job => job._id);
    
    res.status(200).json({ data: jobIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, refreshToken, getUsers, getCurrentUser, updateAvatar, updateUser, getSavedJobs, saveJob, getSavedJobIds };
