const AccountRouter = require('./AccountRouter');
const SubscribeRouter = require('./SubscribeRouter');

const routes = (app) => {
    app.use('/api/account', AccountRouter);
    app.use('/api/subscribe', SubscribeRouter);
}

module.exports = routes
