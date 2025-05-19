const { getWatchedRecordsByUser, createWatchedRecord, removeWatchedRecord } = require('../services/watchedService');

const getAllWatched = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const page = parseInt(req.query.page) || 1; // Mặc định page = 1
    const limit = parseInt(req.query.limit) || 20; // Mặc định limit = 20
    const offset = (page - 1) * limit; // Tính offset

    try {
        console.log(`🚀 Controller: Get watched records for userid=${userid}, page=${page}, limit=${limit}`);
        const { rows, count } = await getWatchedRecordsByUser(userid, limit, offset);
        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            status: 'OK',
            message: 'Lấy tất cả bản ghi của người dùng thành công',
            data: rows,
            total: count,
            page,
            totalPages,
        });
    } catch (error) {
        console.error('Error getting watched records:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Lấy bản ghi thất bại',
        });
    }
};

const addWatched = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const { videoid } = req.body; // Lấy videoid từ request body

    try {
        const record = await createWatchedRecord(userid, videoid);
        res.status(201).json({
            status: 'OK',
            message: 'Thêm bản ghi thành công',
            data: record,
        });
    } catch (error) {
        console.error('Error adding watched record:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Thêm bản ghi thất bại',
        });
    }
};

const deleteWatched = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const { videoid } = req.params; // Lấy videoid từ params

    try {
        await removeWatchedRecord(userid, videoid);
        res.status(200).json({
            status: 'OK',
            message: 'Xóa bản ghi thành công',
        });
    } catch (error) {
        console.error('Error deleting watched record:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Xóa bản ghi thất bại',
        });
    }
};

module.exports = {
    getAllWatched,
    addWatched,
    deleteWatched,
};