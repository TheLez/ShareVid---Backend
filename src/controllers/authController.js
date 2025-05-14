const { refreshAccessToken } = require('../services/JwtService');

const refreshTokenHandler = (req, res) => {
    const refreshToken = req.body.token; // Lấy refresh token từ body

    const newAccessToken = refreshAccessToken(refreshToken);
    if (newAccessToken) {
        res.json({ accessToken: newAccessToken });
    } else {
        res.status(403).json({ status: 'ERR', message: 'Refresh token không hợp lệ' });
    }
};

module.exports = {
    refreshTokenHandler
};