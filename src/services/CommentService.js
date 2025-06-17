const CommentModel = require('../models/CommentModel'); // Đường dẫn tới model Comment
const AccountModel = require('../models/AccountModel'); // Đường dẫn tới model Account
const VideoModel = require('../models/VideoModel'); // Đường dẫn tới model Video
const NotificationModel = require('../models/NotificationModel'); // Đường dẫn tới model Notification
const { sequelize } = require('../models'); // Import sequelize instance

const getAllComments = async () => {
    return await CommentModel.findAll({
        include: [{
            model: AccountModel,
            attributes: ['userid', 'name', 'avatar'] // Chọn các thuộc tính cần thiết của tài khoản
        }]
    });
};

const getCommentsByVideoId = async (videoid, limit, offset) => {
    return await CommentModel.findAll({
        where: {
            videoid,
            status: 1
        },
        include: [{
            model: AccountModel,
            attributes: ['userid', 'name', 'avatar'],
        }],
        order: [
            ['created_at', 'DESC'],
            ['commentid', 'DESC']
        ], // Sắp xếp mới nhất
        limit,
        offset,
    });
};


const addComment = async (content, userid, videoid) => {
    const transaction = await sequelize.transaction();
    try {
        // Tạo bản ghi bình luận
        const newComment = await CommentModel.create({
            content,
            userid,
            videoid,
            status: 1
        }, { transaction });

        // Lấy tên người bình luận từ AccountModel
        const user = await AccountModel.findByPk(userid, {
            attributes: ['name'],
            transaction,
        });

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        // Lấy tiêu đề video và userid của người đăng
        const video = await VideoModel.findByPk(videoid, {
            attributes: ['title', 'userid'],
            transaction,
        });

        if (!video) {
            throw new Error('Video không tồn tại');
        }

        // Tạo thông báo cho người đăng video
        const contentNotification = `Người dùng ${user.name} đã bình luận tại video ${video.title} của bạn`;

        await NotificationModel.create({
            content: contentNotification,
            created_at: new Date(),
            status: 0, // Chưa đọc
            userid: video.userid,
        }, { transaction });

        console.log(`🔍 Service: Đã tạo bình luận và thông báo cho video ${videoid}, chủ sở hữu: ${video.userid}`);
        await transaction.commit();
        return newComment;
    } catch (error) {
        await transaction.rollback();
        console.error(`❌ Service: Lỗi khi thêm bình luận: ${error.message}`);
        throw error;
    }
};

const updateComment = async (commentid, content) => {
    return await CommentModel.update({ content }, { where: { commentid } });
};

const deleteComment = async (commentid) => {
    return await CommentModel.destroy({ where: { commentid } });
};

module.exports = {
    getAllComments,
    getCommentsByVideoId,
    addComment,
    updateComment,
    deleteComment,
};