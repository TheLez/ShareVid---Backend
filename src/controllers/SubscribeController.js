const SubscribeService = require('../services/SubscribeService');

const addSubscription = async (req, res) => {
    const userid = req.user.userid; // Lấy userid từ thông tin người dùng đã xác thực
    const { useridsub } = req.body; // Lấy useridsub từ body của yêu cầu

    try {
        const newSubscription = await SubscribeService.addSubscription(userid, useridsub);
        return res.status(201).json(newSubscription);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

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

const checkSubscribe = async (req, res) => {
    try {
        const { userid } = req.params; // Lấy useridsub từ params
        const currentUserId = req.user.userid; // Lấy userid từ token (giả định middleware xác thực)

        console.log(`🚀 Controller: Check subscribe for user ${currentUserId} to channel ${userid}`);
        const result = await SubscribeService.checkSubscribe(currentUserId, userid);

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Controller: Error in checkSubscribe:', error.message);
        res.status(500).json({ error: 'Không thể kiểm tra trạng thái đăng ký.' });
    }
};

module.exports = {
    addSubscription,
    getAllSubscriptions,
    getSubscriptionByUserId,
    getTopSubscriptions,
    deleteSubscription,
    checkSubscribe
};