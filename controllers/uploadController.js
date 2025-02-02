const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const uploadFile = async (req, res) => {
    try {
        const file = req.file;

        // Kiểm tra loại file để chọn thư mục và resource_type
        let folder = "others";
        let resourceType = "raw";

        if (file.mimetype.startsWith("image/")) {
            folder = "images";
            resourceType = "image";
        } else if (file.mimetype === "application/pdf") {
            folder = "documents";
        } else {
            console.log("Unsupported file type.");
        }

        // Upload file lên Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            resource_type: resourceType,
        });

        // Xóa file tạm sau khi upload
        fs.unlinkSync(file.path);

        res.status(200).json({
            message: "Upload thành công",
            fileUrl: result.secure_url,
            publicId: result.public_id,
            folder: folder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload thất bại", error: error.message });
    }
};

module.exports = { uploadFile };
