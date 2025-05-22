const AccountModel = require('../models/AccountModel');
const VideoModel = require('../models/VideoModel');
const SubscribeModel = require('../models/SubscribeModel');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('./JwtService');
const s3 = require('../config/awsConfig');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const createAccount = async (newAccount, file) => {
    const { name, password, email, role = 'user', gender, birth, subscription = 0, accountdescribe = '' } = newAccount;
    const status = 1; // Mặc định status là 1

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
            created_at: new Date(), // Lấy thời gian hiện tại
            gender,
            birth,
            avatar: avatarUrl,
            status,
            subscription,
            accountdescribe,
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
        const { email, password } = loginAccount;

        try {
            // Kiểm tra xem email đã tồn tại hay chưa
            const checkAccount = await AccountModel.findOne({
                where: { email: email }
            });

            if (!checkAccount) {
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

            const access_token = await generateAccessToken({
                userid: checkAccount.userid,
                role: checkAccount.role,
            });

            const refresh_token = await generateRefreshToken({
                userid: checkAccount.userid,
                role: checkAccount.role,
            });

            // Trả về thông tin tài khoản cùng với token
            return resolve({
                status: 'OK',
                message: 'Đăng nhập thành công',
                access_token,
                refresh_token,
                account: {
                    id: checkAccount.userid,
                    name: checkAccount.name, // Giả sử bạn có trường name trong model
                    role: checkAccount.role,
                    avatar: checkAccount.avatar
                    // Thêm các thông tin khác nếu cần
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

const updateAccountById = async (userid, updateData, file) => {
    try {
        let avatarUrl = updateData.avatar; // Giữ avatar từ updateData nếu có

        // Nếu có file ảnh, tải lên S3
        if (file) {
            console.log(`Uploading avatar for userid: ${userid}`);
            const avatarKey = `avatars/${userid}/${Date.now()}_${file.originalname}`;
            const s3Response = await s3.upload({
                Bucket: process.env.S3_BUCKET,
                Key: avatarKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }).promise();

            avatarUrl = s3Response.Location;
            console.log(`Avatar uploaded to S3: ${avatarUrl}`);
        }

        const updatePayload = {
            name: updateData.name,
            gender: updateData.gender,
            birth: updateData.birth,
            email: updateData.email,
            role: updateData.role,
            status: updateData.status,
            avatar: avatarUrl,
            accountdescribe: updateData.accountdescribe
        };

        // Loại bỏ các trường undefined
        Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

        // Kiểm tra status hợp lệ
        if (updatePayload.status !== undefined && ![0, 1].includes(updatePayload.status)) {
            return {
                status: 'ERROR',
                message: 'Trạng thái không hợp lệ, phải là 0 hoặc 1.'
            };
        }

        const [updatedCount] = await AccountModel.update(updatePayload, {
            where: { userid }
        });

        if (updatedCount === 0) {
            return {
                status: 'ERROR',
                message: 'Không tìm thấy tài khoản để cập nhật'
            };
        }

        const updatedAccount = await AccountModel.findOne({
            where: { userid }
        });

        return {
            status: 'OK',
            message: 'Cập nhật tài khoản thành công',
            data: updatedAccount
        };
    } catch (error) {
        console.error('Service: Error updating account by id:', error);
        return {
            status: 'ERROR',
            message: `Cập nhật tài khoản thất bại: ${error.message}`
        };
    }
};

const deleteAccount = async (userid) => {
    try {
        const deletedCount = await AccountModel.findOne({
            where: { userid: userid }
        });

        if (!deletedCount) {
            return {
                status: 'ERROR',
                message: 'Không tìm thấy tài khoản để xóa'
            };
        }

        await AccountModel.destroy({ where: { userid: userid } });
        return {
            status: 'OK',
            message: 'Tài khoản đã được xóa thành công'
        };
    } catch (error) {
        throw new Error('Xóa tài khoản thất bại');
    }
};

const getAllAccount = async ({ page = 1, limit = 10, search = '' }) => {
    try {
        const offset = (page - 1) * limit;
        const where = search ? {
            [Op.or]: [
                { userid: search }, // Tìm chính xác userid
                { name: { [Op.like]: `%${search}%` } } // Tìm gần đúng name
            ]
        } : {};

        const { count, rows } = await AccountModel.findAndCountAll({
            where,
            offset,
            limit,
            attributes: [
                'userid',
                'name',
                'email',
                'role',
                'status',
                'created_at',
                'gender',
                'birth',
                'avatar',
                'accountdescribe',
                'subscription'
            ],
            order: [
                ['created_at', 'DESC'],
                ['userid', 'DESC']
            ]
        });

        return {
            status: 'OK',
            message: 'Lấy danh sách tài khoản thành công',
            data: {
                accounts: rows,
                total: count,
                page,
                limit
            }
        };
    } catch (e) {
        console.error('Error fetching accounts:', e);
        throw new Error('Lỗi khi lấy danh sách tài khoản: ' + e.message);
    }
};

const getAccountById = async (userid) => {
    try {
        const account = await AccountModel.findOne({
            where: { userid: userid },
        });

        if (!account) {
            return {
                status: 'ERROR',
                message: 'Không tìm thấy tài khoản'
            };
        }

        return {
            status: 'OK',
            message: 'Lấy thông tin tài khoản thành công',
            data: {
                account
            }
        };
    } catch (error) {
        console.error('Error fetching account:', error);
        throw new Error('Failed to fetch account');
    }
};

const searchAccounts = async (query, page, limit) => {
    try {
        console.log(`🔍 Service: Searching accounts with query=${query}, page=${page}, limit=${limit}`);

        // Kiểm tra tham số
        if (!query) {
            throw new Error('Thiếu tham số query.');
        }
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedLimit) || parsedLimit < 1) {
            throw new Error('Trang hoặc giới hạn không hợp lệ.');
        }

        // Xây dựng điều kiện tìm kiếm
        const searchConditions = {
            name: { [Op.like]: `%${query}%` } // Tìm kiếm không phân biệt hoa thường
        };

        // Tính toán phân trang
        const offset = (parsedPage - 1) * parsedLimit;

        // Tìm kiếm kênh
        const { count, rows } = await AccountModel.findAndCountAll({
            where: searchConditions,
            attributes: ['userid', 'name', 'avatar', 'subscription'],
            offset,
            limit: parsedLimit,
            raw: true
        });

        return {
            data: rows,
            total: count,
            page: parsedPage,
            totalPages: Math.ceil(count / parsedLimit)
        };
    } catch (error) {
        console.error('❌ Service: Error searching accounts:', error.message);
        throw error;
    }
};

const updateAccount = async (userid, data, file) => {
    try {
        console.log(`Updating account for userid: ${userid}, data:`, data);
        const account = await AccountModel.findOne({ where: { userid: userid } });
        if (!account) throw new Error('Account not found');

        let avatarUrl = data.avatar || account.avatar; // Giữ avatar hiện tại nếu không có thay đổi

        // Nếu có file ảnh, tải lên S3
        if (file) {
            console.log(`Uploading avatar for userid: ${userid}`);
            const avatarKey = `avatars/${file.originalname}`;
            const s3Response = await s3.upload({
                Bucket: process.env.S3_BUCKET,
                Key: avatarKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }).promise();

            avatarUrl = s3Response.Location;
            console.log(`Avatar uploaded to S3: ${avatarUrl}`);
        }

        await account.update({
            name: data.name,
            avatar: avatarUrl,
            accountdescribe: data.accountdescribe
        });

        console.log(`Account updated: ${userid}`);
        return account;
    } catch (error) {
        console.error('Error updating account:', error);
        throw new Error(`Failed to update account: ${error.message}`);
    }
};

module.exports = {
    getAllAccount,
    getAccountById,
    createAccount,
    loginAccount,
    updateAccount,
    deleteAccount,
    searchAccounts,
    updateAccountById
};