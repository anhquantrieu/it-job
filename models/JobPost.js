const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Tiêu đề bài tuyển dụng là bắt buộc"],
            trim: true,
        },
        salary: {
            type: String,
            required: [true, "Mức lương là bắt buộc"],
        },
        experience: {
            type: String,
            required: [true, "Yêu cầu kinh nghiệm là bắt buộc"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Địa điểm làm việc là bắt buộc"],
        },
        positionLevel: {
            type: String,
            required: [true, "Cấp bậc là bắt buộc"],
        },
        vacancies: {
            type: Number,
            required: [true, "Số lượng tuyển dụng là bắt buộc"],
            min: [1, "Phải tuyển dụng ít nhất một người"],
        },
        jobType: {
            type: String,
            enum: ["Full-time", "Part-time", "Remote", "Freelance", "Contract"],
            required: [true, "Hình thức làm việc là bắt buộc"],
        },
        genderPreference: {
            type: String,
            enum: ["Male", "Female", "Other"],
            default: "Other",
        },
        jobDescription: {
            type: [String], // Chuyển sang mảng chuỗi
            required: [true, "Mô tả công việc là bắt buộc"],
        },
        candidateRequirements: {
            type: [String], // Chuyển sang mảng chuỗi
            required: [true, "Yêu cầu ứng viên là bắt buộc"],
        },
        benefits: {
            type: [String], // Chuyển sang mảng chuỗi
            required: [true, "Quyền lợi là bắt buộc"],
        },
        workAddress: {
            type: String,
            required: [true, "Địa điểm làm việc là bắt buộc"],
        },
        workTime: {
            type: String,
            required: [true, "Thời gian làm việc là bắt buộc"],
        },
        applicationDeadline: {
            type: Date,
            required: [true, "Hạn nộp hồ sơ là bắt buộc"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Tham chiếu đến model Recruiter
            required: [true, "Người tạo bài tuyển dụng là bắt buộc"],
        },
        category: {
            type: String,
            required: [true, "Ngành nghề là bắt buộc"],
            enum: ["IT", "Others"],
        },
        field: {
            type: String
        }
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    }
);

module.exports = mongoose.model("JobPost", jobPostSchema);
