const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, account) {
        if (err) {
            return res.status(401).json({
                status: 'ERR',
                message: 'Xác thực không thành công'
            });
        }
        const { payload } = account;
        if (payload.role === 'admin') {
            next();
        }
        else {
            return res.status(401).json({
                status: 'ERR',
                message: 'Xác thực không thành công'
            });
        }
    });
}

module.exports = {
    authMiddleware
}