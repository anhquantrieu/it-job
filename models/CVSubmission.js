const mongoose = require("mongoose");

const CVSubmissionSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Họ và tên là bắt buộc"],
    },
    email: {
        type: String,
        required: [true, "Email là bắt buộc"],
    },
    phone: {
        type: String,
        required: [true, "Số điện thoại là bắt buộc"],
    },
    coverLetter: {
        type: String,
        required: false,
    },
    cvInfo: {
        url: {
            type: String,
            required: true,
            match: [
                /^(https?:\/\/)?([\w\-])+\.{1}([a-z]{2,63})([\/\w\.\-]*)*\/?$/,
                "URL không hợp lệ",
            ],
        },
        publicId: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Người nộp CV là bắt buộc"],
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Người nhận CV là bắt buộc"],
    },
    jobPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobPost", // ID bài tuyển dụng
        required: [true, "Bài tuyển dụng là bắt buộc"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("CVSubmission", CVSubmissionSchema);
