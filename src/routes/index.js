const AccountRouter = require('./AccountRouter');
const SubscribeRouter = require('./SubscribeRouter');
const VideoRouter = require('./VideoRouter');
const LikeVideoRouter = require('./LikeVideoRouter');
const CommentRouter = require('./CommentRouter');
const WatchedRouter = require('./WatchedRouter');
const LikeCommentRouter = require('./LikeCommentRouter');
const SaveVideoRouter = require('./SaveVideoRouter');
const NotificationRouter = require('./NotificationRouter');

const routes = (app) => {
    app.use('/api/account', AccountRouter);
    app.use('/api/subscribe', SubscribeRouter);
    app.use('/api/video', VideoRouter);
    app.use('/api/like', LikeVideoRouter);
    app.use('/api/comment', CommentRouter);
    app.use('/api/watched', WatchedRouter);
    app.use('/api/like-comment', LikeCommentRouter);
    app.use('/api/save-video', SaveVideoRouter);
    app.use('/api/notification', NotificationRouter);
}

module.exports = routes
