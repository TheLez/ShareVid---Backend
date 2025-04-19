const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// Định nghĩa model Likecomment
const LikecommentModel = sequelize.define('Likecomment', {
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'account', // Tên bảng tham chiếu
            key: 'userid',    // Khóa chính tham chiếu
        },
    },
    commentid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'comment', // Tên bảng tham chiếu
            key: 'commentid', // Khóa chính tham chiếu
        },
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'likecomment',
    timestamps: false, // Không sử dụng các trường createdAt, updatedAt mặc định
});

// Xuất model
module.exports = LikecommentModel;