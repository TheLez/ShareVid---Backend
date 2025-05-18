const AccountService = require('../services/AccountService');

const createAccount = async (req, res) => {
    try {
        const { name, password, confirmpassword, gender, birth, email, role } = req.body; // Lấy role từ req.body
        const file = req.file; // Lấy file ảnh từ req.file
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const checkEmail = reg.test(email);

        // Kiểm tra thông tin đầu vào
        if (!name || !password || !confirmpassword || !gender || !birth || !email) {
            return res.status(400).json({
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

        // Thiết lập giá trị mặc định cho role
        const accountRole = role || 'user'; // Mặc định là 'user' nếu không có role

        const response = await AccountService.createAccount({
            name,
            password,
            email,
            role: accountRole, // Sử dụng role đã được thiết lập
            gender,
            birth,
            accountdescribe: req.body.accountdescribe || '', // Nếu không truyền, mặc định là ''
        }, file); // Truyền cả req.body và file

        return res.status(201).json(response); // Sử dụng 201 cho tài nguyên mới được tạo
    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Đã xảy ra lỗi'
        });
    }
}

const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body; // Chỉ cần email và password
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const checkEmail = reg.test(email);

        if (!email || !password) {
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

        // Kiểm tra thông tin đầu vào
        if (!userid || !updateData) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Cần điền đủ thông tin'
            });
        }

        const response = await AccountService.updateAccount(userid, updateData);
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

const searchAccounts = async (req, res) => {
    try {
        const { query, page = 1, limit = 20 } = req.query;

        console.log(`🚀 Controller: Search accounts with query=${query}, page=${page}, limit=${limit}`);

        if (!query) {
            return res.status(400).json({ error: 'Thiếu tham số query.' });
        }

        const result = await AccountService.searchAccounts(query, parseInt(page), parseInt(limit));

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Controller: Error in searchAccounts:', error.message);
        res.status(500).json({ error: 'Không thể tìm kiếm Kênh.' });
    }
};

module.exports = {
    getAllAccount,
    getAccountById,
    createAccount,
    loginAccount,
    updateAccount,
    deleteAccount,
    searchAccounts
}