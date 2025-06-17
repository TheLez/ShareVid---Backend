const { getWatchedRecordsByUser, createWatchedRecord, removeWatchedRecord, updateWatchedRecord } = require('../services/WatchedService');

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
    try {
        const userid = req.user.userid; // Lấy từ authMiddleware
        const { videoid } = req.body; // Lấy videoid từ body

        // Gọi service
        const watchedid = await createWatchedRecord(userid, videoid);

        // Trả về response
        return res.status(201).json({
            status: 'OK',
            message: 'Thêm bản ghi thành công',
            data: { watchedid },
        });
    } catch (error) {
        console.error('❌ Controller: Error adding watched record:', error.message);
        const statusCode = error.message.includes('không hợp lệ') ? 400 : 500;
        return res.status(statusCode).json({
            status: 'ERROR',
            message: error.message || 'Thêm bản ghi thất bại',
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

const updateWatched = async (req, res) => {
    try {
        const { watchedid } = req.params; // Lấy watchedid từ params
        const { watch_time, created_at } = req.body;
        const userid = req.user.userid; // Lấy userid để kiểm tra quyền (tùy chọn)

        console.log(`🚀 Controller: Cập nhật watched record cho watchedid=${watchedid}`);

        // Chuyển đổi watchedid thành số nguyên
        const parsedWatchedid = parseInt(watchedid);
        if (isNaN(parsedWatchedid) || parsedWatchedid <= 0) {
            return res.status(400).json({ error: 'watchedid không hợp lệ' });
        }

        // Gọi service để cập nhật
        const updatedRecord = await updateWatchedRecord(
            parsedWatchedid,
            watch_time,
            created_at,
            userid // Truyền userid để kiểm tra quyền
        );

        // Trả về response thành công
        return res.status(200).json({
            message: 'Cập nhật bản ghi watched thành công',
            data: {
                watchedid: updatedRecord.watchedid,
                userid: updatedRecord.userid,
                videoid: updatedRecord.videoid,
                watch_time: updatedRecord.watch_time,
                created_at: updatedRecord.created_at,
            },
        });
    } catch (error) {
        // Xử lý lỗi
        const statusCode = error.message.includes('Không tìm thấy') ? 404 : 400;
        return res.status(statusCode).json({ error: error.message });
    }
};

module.exports = {
    getAllWatched,
    addWatched,
    deleteWatched,
    updateWatched
};