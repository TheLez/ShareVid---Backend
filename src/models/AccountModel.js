const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

const AccountModel = sequelize.define('Account', {
    userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING(255),
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
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    avatar: {
        type: DataTypes.STRING(2000),
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subscription: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accountdescribe: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        defaultValue: '', // Giá trị mặc định là chuỗi rỗng
    },
}, {
    tableName: 'account',
    timestamps: false,
});

// Xuất model
module.exports = AccountModel;