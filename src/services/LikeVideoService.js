const LikeVideoModel = require('../models/LikevideoModel'); // Import model LikeVideo
const VideoModel = require('../models/VideoModel'); // Import model Video
const AccountModel = require('../models/AccountModel'); // Import model Account

const getLikedVideos = async (userid, page, limit) => {
    try {
        console.log(`🔍 Service: Getting liked videos for userid=${userid}, page=${page}, limit=${limit}`);

        // Kiểm tra tham số
        if (!userid || isNaN(parseInt(userid)) || parseInt(userid) <= 0) {
            throw new Error('ID người dùng không hợp lệ.');
        }
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedLimit) || parsedLimit < 1) {
            throw new Error('Trang hoặc giới hạn không hợp lệ.');
        }

        // Tính toán phân trang
        const offset = (parsedPage - 1) * parsedLimit;

        // Tìm kiếm video đã thích
        const { count, rows } = await LikeVideoModel.findAndCountAll({
            where: {
                userid: parseInt(userid),
                type: 1 // Chỉ lấy bản ghi có type = 1 (like)
            },
            include: [
                {
                    model: VideoModel,
                    required: true,
                    attributes: [
                        'videoid',
                        'title',
                        'thumbnail',
                        'videoview',
                        'created_at',
                        'videotype',
                        'videolike',
                        'videodislike',
                        'videodescribe',
                        'status',
                        'userid'
                    ],
                    include: [
                        {
                            model: AccountModel,
                            attributes: ['userid', 'name', 'avatar'],
                        }
                    ],
                    where: { status: 1 } // Chỉ lấy video có status = 1
                }
            ],
            offset,
            limit: parsedLimit,
            raw: true,
            nest: true
        });

        // Log để kiểm tra
        console.log(`🔍 Service: Found ${rows.length} liked videos, total: ${count}, video IDs: ${rows.map(row => row.Video.videoid).join(', ')}`);

        return {
            data: rows.map(row => ({
                ...row.Video,
                Account: row.Video.Account
            })),
            total: count,
            page: parsedPage,
            totalPages: Math.ceil(count / parsedLimit)
        };
    } catch (error) {
        console.error('❌ Service: Error getting liked videos:', error.message);
        throw error;
    }
};

const addLike = async (userid, videoid, type) => { // ✅ Nhận type
    const existingLike = await LikeVideoModel.findOne({
        where: { userid, videoid }
    });

    if (existingLike) {
        throw new Error('Like already exists');
    }

    const newLike = await LikeVideoModel.create({
        userid,
        videoid,
        type,
        created_at: new Date(),
    });

    return newLike;
};

const removeLike = async (userid, videoid) => {
    // Xóa bản ghi like
    const result = await LikeVideoModel.destroy({
        where: { userid, videoid }
    });

    if (result === 0) {
        throw new Error('Like not found');
    }

    return { message: 'Like removed successfully' };
};

// Lấy thông tin like cho một video
const getLikeInfoByVideoId = async (userid, videoid) => {
    const likeInfo = await LikeVideoModel.findOne({
        where: { userid, videoid }
    });

    if (likeInfo) {
        return { liked: true, type: likeInfo.type }; // Trả về thông tin like
    } else {
        return { liked: false }; // Không có like cho video này
    }
};

module.exports = {
    getLikedVideos,
    addLike,
    removeLike,
    getLikeInfoByVideoId, // Thêm chức năng mới
};