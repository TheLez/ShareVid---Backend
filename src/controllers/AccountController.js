const AccountService = require('../services/AccountService');

const createAccount = async (req, res) => {
    try {
        console.log(req.body)
        const res = await AccountService.createAccount();
        return res.status(200).json(res);
    } catch (e) {
        return res.status(404).json({
            message: e
        });
    }
}

module.exports = {
    createAccount
}