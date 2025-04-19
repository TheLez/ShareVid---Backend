const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

const AccountModel = sequelize.define('Account', {
    userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true, // Nếu bạn muốn tự động tăng
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING(255), // Độ dài tối đa cho mật khẩu
        allowNull: false,
    },
    gender: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    birth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true, // Đảm bảo email là duy nhất
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Đặt giá trị mặc định là thời điểm hiện tại
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'account',
    timestamps: false, // Không sử dụng các trường createdAt, updatedAt
});

// Xuất model
module.exports = AccountModel;