const AccountService = require('../services/AccountService');

const createAccount = async (req, res) => {
    try {
        const { name, password, confirmpassword, gender, birth, email, role, created_at, avatar, status } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const checkEmail = reg.test(email);
        if (!name || !password || !confirmpassword || !gender || !birth || !email || !created_at || !avatar) {
            return res.status(400).json({ // Sử dụng 400 cho lỗi yêu cầu không hợp lệ
                status: 'ERR',
                message: 'Cần điền đủ thông tin'
            });
        } else if (!checkEmail) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Email không hợp lệ'
            });
        } else if (password !== confirmpassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Mật khẩu không khớp'
            });
        }
        const response = await AccountService.createAccount(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({ // Sử dụng 500 cho lỗi máy chủ
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body; // Chỉ cần email và password
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const checkEmail = reg.test(email);
        if (!password || !email) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Cần điền đủ thông tin'
            });
        } else if (!checkEmail) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Email không hợp lệ'
            });
        }
        const response = await AccountService.loginAccount(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

const updateAccount = async (req, res) => {
    try {
        const userid = req.params.id;
        const updateData = req.body; // Lấy dữ liệu cần cập nhật từ req.body

        // Kiểm tra thông tin đầu vào nếu cần
        if (!userid || !updateData) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Cần điền đủ thông tin'
            });
        }

        // Gọi dịch vụ cập nhật tài khoản
        const response = await AccountService.updateAccount(userid, updateData); // Sử dụng hàm cập nhật từ AccountService
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

const deleteAccount = async (req, res) => {
    try {
        const userid = req.params.id; // Lấy userid từ tham số URL

        // Kiểm tra xem userid có hợp lệ không
        if (!userid) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Cần điền đủ thông tin'
            });
        }

        const response = await AccountService.deleteAccount(userid);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

const getAllAccount = async (req, res) => {
    try {
        const response = await AccountService.getAllAccount();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

const getAccountById = async (req, res) => {
    try {
        const userid = req.params.id; // Lấy userid từ tham số URL

        // Kiểm tra xem userid có hợp lệ không
        if (!userid) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Cần điền đủ thông tin'
            });
        }

        const response = await AccountService.getAccountById(userid);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

module.exports = {
    getAllAccount,
    getAccountById,
    createAccount,
    loginAccount,
    updateAccount,
    deleteAccount
}