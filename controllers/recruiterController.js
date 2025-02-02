const Recruiter = require("../models/Recruiter");
const uploadFile = require("../utils/upload");
// Tạo nhà tuyển dụng mới
const createRecruiter = async (req, res) => {
    try {
        const { name, email, password, companyName } = req.body;
        // Kiểm tra nếu file logo được gửi kèm
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Logo là bắt buộc. Vui lòng tải lên file logo.",
            });
        }
        
        const result = await uploadFile(req.file);
        if(!result){
            return res.status(400).json({
                success: false,
                message: "Lỗi khi upload file logo.",
            });
        }
        const existingRecruiter = await Recruiter.findOne({ email });
        if (existingRecruiter) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        const recruiterData = {
            ...req.body,
            logoInfo: {
                url: result.secure_url,
                publicId: result.public_id,
            },
        };

        const recruiter = await Recruiter.create(recruiterData);

        return res.status(201).json({
            success: true,
            message: "Nhà tuyển dụng đã được tạo thành công",
            data: recruiter,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi tạo nhà tuyển dụng",
        });
    }
};

// Lấy danh sách nhà tuyển dụng
const getAllRecruiters = async (req, res) => {
    try {
        const recruiters = await Recruiter.find();
        return res.status(200).json({
            success: true,
            data: recruiters,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách nhà tuyển dụng",
        });
    }
};

// Lấy thông tin một nhà tuyển dụng theo ID
const getRecruiterById = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.params.id);
        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Nhà tuyển dụng không tồn tại",
            });
        }
        return res.status(200).json({
            success: true,
            data: recruiter,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Không thể lấy thông tin nhà tuyển dụng",
        });
    }
};

// Cập nhật thông tin nhà tuyển dụng
const updateRecruiter = async (req, res) => {
    try {
        const recruiter = await Recruiter.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Trả về đối tượng sau khi cập nhật
        );

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Nhà tuyển dụng không tồn tại",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật nhà tuyển dụng thành công",
            data: recruiter,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Lỗi khi cập nhật nhà tuyển dụng",
        });
    }
};

// Xóa nhà tuyển dụng
const deleteRecruiter = async (req, res) => {
    try {
        const recruiter = await Recruiter.findByIdAndDelete(req.params.id);
        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Nhà tuyển dụng không tồn tại",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Nhà tuyển dụng đã được xóa thành công",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Không thể xóa nhà tuyển dụng",
        });
    }
};
module.exports = {
    createRecruiter,
    getAllRecruiters,
    getRecruiterById,
    updateRecruiter,
    deleteRecruiter,
};