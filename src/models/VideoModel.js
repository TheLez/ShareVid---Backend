const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Định nghĩa model Video
const VideoModel = sequelize.define('Video', {
    videoid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    video: {
        type: DataTypes.STRING(2000),
        allowNull: false,
    },
    thumbnail: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    videotype: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    videoview: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    videolike: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    videodislike: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    videodescribe: {
        type: DataTypes.STRING(1000),
        defaultValue: '',
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userid: {
        type: DataTypes.INTEGER,
        references: {
            model: 'account', // Thay đổi tên bảng tham chiếu
            key: 'userid',
        },
        allowNull: true,
    },
}, {
    tableName: 'video',
    timestamps: false,
});

// Xuất model
module.exports = VideoModel;