const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'ERR',
            message: 'Không có token'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, account) => {
        if (err) {
            return res.status(401).json({
                status: 'ERR',
                message: 'Xác thực không thành công'
            });
        }

        // Gán userid và role vào req.user
        req.user = { userid: account.payload.userid, role: account.payload.role };

        next();
    });
};

module.exports = {
    authMiddleware
};