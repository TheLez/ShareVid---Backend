const AccountModel = require('../models/AccountModel');
const bcrypt = require('bcrypt');
const { generalAccessToken, generalRefreshToken } = require('./JwtService');

const createAccount = (newAccount) => {
    return new Promise(async (resolve, reject) => {
        const { name, password, confirmpassword, gender, birth, email, role, created_at, avatar, status } = newAccount;

        try {
            // Kiểm tra xem email đã tồn tại hay chưa
            const checkAccount = await AccountModel.findOne({
                where: {
                    email: email
                }
            });

            // Nếu email đã tồn tại, trả về thông báo lỗi
            if (checkAccount) {
                return resolve({
                    status: 'ERROR',
                    message: 'Email đã tồn tại'
                });
            }

            // Nếu email chưa tồn tại, tiếp tục tạo tài khoản mới
            const hash = bcrypt.hashSync(password, 10);
            console.log('hash', hash);
            const createAccount = await AccountModel.create({
                name,
                password: hash,
                gender,
                birth,
                email,
                role,
                created_at,
                avatar,
                status
            });

            // Kiểm tra xem tài khoản có được tạo thành công hay không
            if (createAccount) {
                return resolve({
                    status: 'OK',
                    message: 'Tạo tài khoản thành công',
                    data: createAccount
                });
            }

            resolve({});
        } catch (e) {
            reject(e);
        }
    });
}

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

const getAccountById = (userid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const account = await AccountModel.findOne({
                where: {
                    userid: userid
                }
            });
            if (!account) {
                return resolve({
                    status: 'ERROR',
                    message: 'Không tìm thấy tài khoản'
                });
            }
            return resolve({
                status: 'OK',
                message: 'Lấy thông tin tài khoản thành công',
                data: account
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    getAllAccount,
    getAccountById,
    createAccount,
    loginAccount,
    updateAccount,
    deleteAccount
}