const cloudinary = require("../utils/cloudinary");
const fs = require("fs");


const uploadFile = async (fileP) => {
    const file = fileP;

    // Kiểm tra loại file để chọn thư mục và resource_type
    let folder = "others";
    let resourceType = "raw";

    try {
        if (file.mimetype.startsWith("image/")) {
            folder = "images";
            resourceType = "image";
        } else if (file.mimetype === "application/pdf") {
            folder = "documents";
        } else {
            throw new Error("Unsupported file type. Only images and PDFs are allowed.");
        }

        // Upload file lên Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: resourceType,
        });

        return result; // Trả về kết quả upload
    } catch (error) {
        console.error("Error during file upload:", error);
        throw error; // Throw lỗi để controller xử lý
    } finally {
        // Xóa file tạm sau khi upload hoặc gặp lỗi
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
};

module.exports = uploadFile;
