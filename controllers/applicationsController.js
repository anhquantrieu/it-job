const CVSubmission = require("../models/CVSubmission");

const getApplicationsByRecruiter = async (req, res) => {
    try {
        const { receivedBy } = req.query; // Nhận giá trị từ query hoặc params

        if (!receivedBy) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin receivedBy",
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Tìm tất cả các CV với `receivedBy`
        const submissions = await CVSubmission.find({ receivedBy })
            .populate("jobPostId")
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await CVSubmission.countDocuments();
        res.status(200).json({
            success: true,
            message: "Lấy danh sách CV thành công",
            data: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalSubmissions: total,
                submissions,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lấy danh sách CV thất bại",
            error: error.message,
        });
    }
};

module.exports = { getApplicationsByRecruiter };