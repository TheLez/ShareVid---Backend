const LikeVideoModel = require('../models/LikevideoModel'); // Import model LikeVideo
const VideoModel = require('../models/VideoModel'); // Import model Video
const AccountModel = require('../models/AccountModel'); // Import model Account
const NotificationModel = require('../models/NotificationModel'); // Import model Notification
const { sequelize } = require('../models'); // Import sequelize instance

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

const addLike = async (userid, videoid, type) => {
    const transaction = await sequelize.transaction();
    try {
        // Kiểm tra xem đã có like/dislike chưa
        const existingLike = await LikeVideoModel.findOne({
            where: { userid, videoid },
            transaction,
        });

        if (existingLike) {
            throw new Error('Like already exists');
        }

        // Tạo bản ghi like mới
        const newLike = await LikeVideoModel.create({
            userid,
            videoid,
            type,
            created_at: new Date(),
        }, { transaction });

        // Lấy userid của người đăng video
        const video = await VideoModel.findByPk(videoid, {
            attributes: ['userid'],
            transaction,
        });

        if (!video) {
            throw new Error('Video không tồn tại');
        }

        // Lấy tên người dùng từ AccountModel
        const user = await AccountModel.findByPk(userid, {
            attributes: ['name'],
            transaction,
        });

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Tạo thông báo cho người đăng video
        const content = type === 1 
            ? `Người dùng ${user.name} đã thích video của bạn`
            : `Người dùng ${user.name} đã không thích video của bạn`;

        await NotificationModel.create({
            content,
            created_at: new Date(),
            status: 0, // Chưa đọc
            userid: video.userid,
        }, { transaction });

        console.log(`🔍 Service: Đã tạo like (type: ${type}) và thông báo cho video ${videoid}, chủ sở hữu: ${video.userid}`);
        await transaction.commit();
        return newLike;
    } catch (error) {
        await transaction.rollback();
        console.error(`❌ Service: Lỗi khi thêm like: ${error.message}`);
        throw error;
    }
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