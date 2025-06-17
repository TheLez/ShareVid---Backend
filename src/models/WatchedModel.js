const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Kết nối Sequelize với cơ sở dữ liệu MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Định nghĩa model Watched
const WatchedModel = sequelize.define('Watched', {
    watchedid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Tự động tăng giá trị
    },
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'account', // Tên bảng tham chiếu
            key: 'userid',   // Khóa chính tham chiếu
        },
    },
    videoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'video',  // Tên bảng tham chiếu
            key: 'videoid',  // Khóa chính tham chiếu
        },
    },
    created_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Giá trị mặc định là thời gian hiện tại
    },
    watch_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '00:00:00', // Giá trị mặc định là 00:00:00
    },
}, {
    tableName: 'watched',
    timestamps: false, // Không sử dụng các trường createdAt, updatedAt mặc định
});

// Xuất model
module.exports = WatchedModel;