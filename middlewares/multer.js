const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu file tạm
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Lưu file tạm trong thư mục uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Kiểm tra loại file hợp lệ
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File không hợp lệ. Chỉ chấp nhận JPG, PNG, PDF."), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
