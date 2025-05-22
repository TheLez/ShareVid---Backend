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

AccountModel.hasMany(SubscribeModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
SubscribeModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
AccountModel.hasMany(SubscribeModel, { foreignKey: 'useridsub', onDelete: 'CASCADE' });
SubscribeModel.belongsTo(AccountModel, { foreignKey: 'useridsub', onDelete: 'CASCADE' });

AccountModel.hasMany(VideoModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
VideoModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

AccountModel.hasMany(LikevideoModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
LikevideoModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

AccountModel.hasMany(WatchedModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
WatchedModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

AccountModel.hasMany(CommentModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
CommentModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

AccountModel.hasMany(LikecommentModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
LikecommentModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

AccountModel.hasMany(SavevideoModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
SavevideoModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

AccountModel.hasMany(NotificationModel, { foreignKey: 'userid', onDelete: 'CASCADE' });
NotificationModel.belongsTo(AccountModel, { foreignKey: 'userid', onDelete: 'CASCADE' });

// Quan hệ cho video
VideoModel.hasMany(LikevideoModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });
LikevideoModel.belongsTo(VideoModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });

VideoModel.hasMany(WatchedModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });
WatchedModel.belongsTo(VideoModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });

VideoModel.hasMany(CommentModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });
CommentModel.belongsTo(VideoModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });

VideoModel.hasMany(SavevideoModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });
SavevideoModel.belongsTo(VideoModel, { foreignKey: 'videoid', onDelete: 'CASCADE' });

// Quan hệ cho comment
CommentModel.hasMany(LikecommentModel, { foreignKey: 'commentid', onDelete: 'CASCADE' });
LikecommentModel.belongsTo(CommentModel, { foreignKey: 'commentid', onDelete: 'CASCADE' });

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
