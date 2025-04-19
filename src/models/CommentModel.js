const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Định nghĩa model Comment
const CommentModel = sequelize.define('Comment', {
    commentid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    content: {
        type: DataTypes.STRING(1000),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Giá trị mặc định là thời gian hiện tại
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'account', // Tên bảng tham chiếu
            key: 'userid',    // Khóa chính tham chiếu
        },
    },
    videoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'video', // Tên bảng tham chiếu
            key: 'videoid', // Khóa chính tham chiếu
        },
    },
}, {
    tableName: 'comment',
    timestamps: false, // Không sử dụng các trường createdAt, updatedAt mặc định
});

// Xuất model
module.exports = CommentModel;