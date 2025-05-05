const AccountRouter = require('./AccountRouter');

const routes = (app) => {
    app.use('/api/account', AccountRouter);
}

module.exports = routes
