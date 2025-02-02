const { verifyToken } = require("../utils/jwt");

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Kiểm tra nếu header không tồn tại hoặc không chứa Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Thiếu hoặc sai định dạng Authorization header" });
    }

    const token = authHeader.split(" ")[1]; // Tách lấy token từ chuỗi `Bearer <token>`

    try {
        // Kiểm tra token và lấy payload
        const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);

        // Nếu payload không hợp lệ (null hoặc undefined)
        if (!payload) {
            return res.status(401).json({ message: "Access token hết hạn hoặc không hợp lệ" });
        }

        // Lưu thông tin user vào request
        req.user = payload;
        next(); // Tiến hành xử lý tiếp theo
    } catch (err) {
        // Xử lý lỗi trong trường hợp token không hợp lệ
        console.error(err); // Log lỗi chi tiết nếu cần thiết
        return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
    }
};

module.exports = { authenticate };
