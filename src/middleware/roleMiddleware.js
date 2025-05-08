const roleMiddleware = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Lấy vai trò từ req.user

        // Kiểm tra xem vai trò của người dùng có nằm trong danh sách vai trò cho phép không
        if (roles.includes(userRole)) {
            return next(); // Cho phép truy cập
        } else {
            return res.status(403).json({
                status: 'ERR',
                message: 'Không có quyền truy cập'
            });
        }
    };
};

module.exports = roleMiddleware;