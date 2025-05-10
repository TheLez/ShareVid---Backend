require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

// Load models
const AccountModel = require('./AccountModel');
const VideoModel = require('./VideoModel');
const CommentModel = require('./CommentModel');
const LikevideoModel = require('./LikevideoModel');
const SubscribeModel = require('./SubscribeModel');
const WatchedModel = require('./WatchedModel');
const LikecommentModel = require('./LikecommentModel');
const SavevideoModel = require('./SavevideoModel');
const NotificationModel = require('./NotificationModel');

// Associations
AccountModel.hasMany(SubscribeModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều đăng ký
SubscribeModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một đăng ký thuộc về một tài khoản
AccountModel.hasMany(SubscribeModel, { foreignKey: 'useridsub' }); // Một tài khoản có nhiều người đăng ký
SubscribeModel.belongsTo(AccountModel, { foreignKey: 'useridsub' }); // Một người đăng ký thuộc về một tài khoản

AccountModel.hasMany(VideoModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều video
VideoModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một video thuộc về một tài khoản

AccountModel.hasMany(LikevideoModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều lượt thích
LikevideoModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một lượt thích thuộc về một tài khoản
VideoModel.hasMany(LikevideoModel, { foreignKey: 'videoid' }); // Một video có nhiều lượt thích
LikevideoModel.belongsTo(VideoModel, { foreignKey: 'videoid' }); // Một lượt thích thuộc về một video

AccountModel.hasMany(WatchedModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều video đã xem
WatchedModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một bản ghi xem thuộc về một tài khoản
VideoModel.hasMany(WatchedModel, { foreignKey: 'videoid' }); // Một video có nhiều bản ghi xem
WatchedModel.belongsTo(VideoModel, { foreignKey: 'videoid' }); // Một bản ghi xem thuộc về một video

AccountModel.hasMany(CommentModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều comment
CommentModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một comment thuộc về một tài khoản
VideoModel.hasMany(CommentModel, { foreignKey: 'videoid' }); // Một video có nhiều comment
CommentModel.belongsTo(VideoModel, { foreignKey: 'videoid' }); // Một comment thuộc về một video

AccountModel.hasMany(LikecommentModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều lượt thích comment
LikecommentModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một lượt thích comment thuộc về một tài khoản
CommentModel.hasMany(LikecommentModel, { foreignKey: 'commentid' }); // Một comment có nhiều lượt thích
LikecommentModel.belongsTo(CommentModel, { foreignKey: 'commentid' }); // Một lượt thích thuộc về một comment

AccountModel.hasMany(SavevideoModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều video đã lưu
SavevideoModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một video đã lưu thuộc về một tài khoản
VideoModel.hasMany(SavevideoModel, { foreignKey: 'videoid' }); // Một video có nhiều tài khoản đã lưu
SavevideoModel.belongsTo(VideoModel, { foreignKey: 'videoid' }); // Một bản ghi đã lưu thuộc về một video

AccountModel.hasMany(NotificationModel, { foreignKey: 'userid' }); // Một tài khoản có nhiều thông báo
NotificationModel.belongsTo(AccountModel, { foreignKey: 'userid' }); // Một thông báo thuộc về một tài khoản

// Export
module.exports = {
    sequelize,
    AccountModel,
    VideoModel,
    CommentModel,
    LikevideoModel,
    SubscribeModel,
    WatchedModel,
    LikecommentModel,
    SavevideoModel,
    NotificationModel
};
