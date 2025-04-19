const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Định nghĩa model Savevideo
const SavevideoModel = sequelize.define('Savevideo', {
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'account', // Tên bảng tham chiếu
            key: 'userid',    // Khóa chính tham chiếu
        },
    },
    videoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'video', // Tên bảng tham chiếu
            key: 'videoid', // Khóa chính tham chiếu
        },
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Giá trị mặc định là thời gian hiện tại
    },
}, {
    tableName: 'savevideo',
    timestamps: false, // Không sử dụng các trường createdAt, updatedAt mặc định
});

// Xuất model
module.exports = SavevideoModel;