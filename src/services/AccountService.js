const AccountModel = require('../models/AccountModel');
const VideoModel = require('../models/VideoModel');
const SubscribeModel = require('../models/SubscribeModel');
const bcrypt = require('bcrypt');
const { generalAccessToken, generalRefreshToken } = require('./JwtService');
const fs = require('fs');
const path = require('path');
const s3 = require('../config/awsConfig');
const multer = require('multer');

const createAccount = async (newAccount, file) => {
    const { name, password, email, role, created_at, gender, birth, status = 1 } = newAccount;

    if (!file) {
        throw new Error('Avatar file is required');
    }

    try {
        // Kiểm tra xem email đã tồn tại hay chưa
        const checkAccount = await AccountModel.findOne({ where: { email: email } });

        if (checkAccount) {
            return { status: 'ERROR', message: 'Email đã tồn tại' };
        }

        // Tải avatar lên S3 từ bộ nhớ
        const avatarKey = `avatars/${file.originalname}`;
        const s3Response = await s3.upload({
            Bucket: process.env.S3_BUCKET,
            Key: avatarKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        }).promise();

        const avatarUrl = s3Response.Location;

        // Hash password
        const hash = bcrypt.hashSync(password, 10);

        // Tạo tài khoản mới
        const account = await AccountModel.create({
            name,
            password: hash,
            email,
            role,
            created_at,
            gender,  // Đảm bảo rằng bạn đã truyền trường gender
            birth,   // Đảm bảo rằng bạn đã truyền trường birth
            avatar: avatarUrl,
            status,
        });

        return {
            status: 'OK',
            message: 'Tạo tài khoản thành công',
            data: account
        };
    } catch (error) {
        console.error('Error creating account:', error);
        throw new Error('Failed to create account');
    }
};

const loginAccount = (loginAccount) => {
    return new Promise(async (resolve, reject) => {
        const { name, password, confirmpassword, gender, birth, email, role, created_at, avatar, status } = loginAccount;

        try {
            // Kiểm tra xem email đã tồn tại hay chưa
            const checkAccount = await AccountModel.findOne({
                where: {
                    email: email
                }
            });

            // Nếu email đã tồn tại, trả về thông báo lỗi
            if (checkAccount === null) {
                return resolve({
                    status: 'ERROR',
                    message: 'Không tìm thấy tài khoản'
                });
            }
            const comparePassword = bcrypt.compareSync(password, checkAccount.password);
            if (!comparePassword) {
                return resolve({
                    status: 'ERROR',
                    message: 'Mật khẩu không đúng'
                });
            }
            if (checkAccount.status === 0) {
                return resolve({
                    status: 'ERROR',
                    message: 'Tài khoản đã bị khóa'
                });
            }
            const access_token = await generalAccessToken({
                userid: checkAccount.userid,
                role: checkAccount.role,
            });

            const refresh_token = await generalRefreshToken({
                userid: checkAccount.userid,
                role: checkAccount.role,
            });

            return resolve({
                status: 'OK',
                message: 'Đăng nhập thành công',
                access_token,
                refresh_token
            })
        } catch (e) {
            reject(e);
        }
    });
}

const updateAccount = async (userid, updateData) => {
    try {
        // Cập nhật thông tin tài khoản trong cơ sở dữ liệu
        const [updatedCount] = await AccountModel.update(updateData, {
            where: { userid: userid }
        });

        if (updatedCount === 0) {
            return {
                status: 'ERROR',
                message: 'Không tìm thấy tài khoản để cập nhật'
            };
        }

        // Lấy thông tin tài khoản đã cập nhật
        const updatedAccount = await AccountModel.findOne({
            where: { userid: userid }
        });

        return {
            status: 'OK',
            message: 'Cập nhật tài khoản thành công',
            data: updatedAccount // Trả về thông tin tài khoản
        };
    } catch (error) {
        throw new Error('Cập nhật tài khoản thất bại');
    }
};

const deleteAccount = async (userid) => {
    try {
        const deletedCount = await AccountModel.findOne({
            where: { userid: userid }
        });

        if (deletedCount === null) {
            return {
                status: 'ERROR',
                message: 'Không tìm thấy tài khoản để xóa'
            };
        }
        await AccountModel.findByIdAndDelete(userid);
        return {
            status: 'OK',
            message: 'Tài khoản đã được xóa thành công'
        };
    } catch (error) {
        throw new Error('Xóa tài khoản thất bại');
    }
};

const getAllAccount = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allAccount = await AccountModel.findAll();
            return resolve({
                status: 'OK',
                message: 'Lấy danh sách tài khoản thành công',
                data: allAccount
            });
        } catch (e) {
            reject(e);
        }
    });
}

const getAccountById = async (userid) => {
    try {
        const account = await AccountModel.findOne({
            where: { userid: userid },
            include: [{
                model: VideoModel,
                where: { userid: userid },
                required: false,
            }]
        });

        if (!account) {
            return {
                status: 'ERROR',
                message: 'Không tìm thấy tài khoản'
            };
        }

        const subscriberCount = await SubscribeModel.count({
            where: { useridsub: userid }
        });

        const videoCount = await VideoModel.count({
            where: { userid: userid }
        });

        return {
            status: 'OK',
            message: 'Lấy thông tin tài khoản thành công',
            data: {
                account,
                subscriberCount,
                videoCount,
            }
        };
    } catch (error) {
        console.error('Error fetching account:', error);
        throw new Error('Failed to fetch account');
    }
};

const getAccountByName = async (name) => {
    try {
        const accounts = await AccountModel.findAll({
            where: {
                name: {
                    [Sequelize.Op.like]: `%${name}%`, // Tìm kiếm với điều kiện LIKE
                },
            },
        });
        return accounts;
    } catch (error) {
        throw new Error('Lỗi khi tìm kiếm tài khoản: ' + error.message);
    }
};

module.exports = {
    getAllAccount,
    getAccountById,
    createAccount,
    loginAccount,
    updateAccount,
    deleteAccount,
    getAccountByName
}