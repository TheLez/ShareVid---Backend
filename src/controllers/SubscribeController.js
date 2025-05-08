const SubscribeService = require('../services/SubscribeService');

const getAllSubscriptions = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    try {
        const subscriptions = await SubscribeService.getAllSubscriptions(userid);
        return res.status(200).json(subscriptions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getSubscriptionByUserId = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    try {
        const subscription = await SubscribeService.getSubscriptionByUserId(userid);
        return res.status(200).json(subscription);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getTopSubscriptions = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    try {
        const topSubscriptions = await SubscribeService.getTopSubscriptions(userid);
        return res.status(200).json(topSubscriptions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteSubscription = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const { useridsub } = req.params;
    try {
        const response = await SubscribeService.deleteSubscription(userid, useridsub);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSubscriptions,
    getSubscriptionByUserId,
    getTopSubscriptions,
    deleteSubscription,
};