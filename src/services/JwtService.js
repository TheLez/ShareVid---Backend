const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = (payload) => {
    const access_token = jwt.sign({
        payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });

    return access_token;
}

const generateRefreshToken = (payload) => {
    const refresh_token = jwt.sign({
        payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '365d' });

    return refresh_token;
}

const refreshAccessToken = (refreshToken) => {
    if (!refreshToken) return null;

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        return generateAccessToken({ userid: payload.userid }); // Giả sử payload chứa userid
    } catch (error) {
        console.error('Refresh token không hợp lệ:', error);
        return null; // Refresh token không hợp lệ
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    refreshAccessToken
}