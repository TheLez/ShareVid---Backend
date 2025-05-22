require('dotenv').config();
const {
    sequelize,
    VideoModel,
    AccountModel,
    CommentModel,
    LikevideoModel,
    SubscribeModel,
    WatchedModel,
    NotificationModel
} = require('../models');

const s3 = require('../config/awsConfig');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const uploadVideo = async (videoFile, thumbnailFile = null, videoData) => {
    if (!videoFile) {
        throw new Error('Video file is required');
    }

    // Kiểm tra videoData
    if (!videoData.title) {
        throw new Error('Title is required');
    }
    if (videoData.status === undefined) {
        throw new Error('Status is required');
    }
    if (!videoData.userid) {
        throw new Error('User ID is required');
    }

    const videoKey = `videos/${videoFile.originalname}`;
    const thumbnailKey = thumbnailFile ? `thumbnails/${thumbnailFile.originalname}` : null;

    try {
        // Upload video từ buffer
        await s3.upload({
            Bucket: process.env.S3_BUCKET,
            Key: videoKey,
            Body: videoFile.buffer,
            ContentType: videoFile.mimetype,
        }).promise();

        let thumbnailUrl = null;

        if (!thumbnailFile) {
            // Tạo thumbnail từ video với tên duy nhất
            const uniqueThumbnailName = `temp-thumbnail-${Date.now()}.jpg`;
            const tempVideoPath = path.join(__dirname, `temp-video-${Date.now()}.mp4`);

            // Ghi video buffer vào tệp tạm
            fs.writeFileSync(tempVideoPath, videoFile.buffer);

            await new Promise((resolve, reject) => {
                ffmpeg(tempVideoPath)
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('Error creating thumbnail:', err);
                        reject(err);
                    })
                    .screenshots({
                        timestamps: [1],
                        filename: uniqueThumbnailName,
                        folder: __dirname,
                        size: '320x240',
                    });
            });

            // Upload thumbnail từ tệp tạm
            const thumbnailData = fs.readFileSync(path.join(__dirname, uniqueThumbnailName));
            await s3.upload({
                Bucket: process.env.S3_BUCKET,
                Key: `thumbnails/${uniqueThumbnailName}`,
                Body: thumbnailData,
                ContentType: 'image/jpeg',
            }).promise();

            thumbnailUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/thumbnails/${uniqueThumbnailName}`;

            // Xóa tệp tạm
            fs.unlinkSync(tempVideoPath);
            fs.unlinkSync(path.join(__dirname, uniqueThumbnailName));
        } else {
            // Upload thumbnail nếu có
            await s3.upload({
                Bucket: process.env.S3_BUCKET,
                Key: thumbnailKey,
                Body: thumbnailFile.buffer,
                ContentType: thumbnailFile.mimetype,
            }).promise();
            thumbnailUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;
        }

        // Lưu thông tin video vào DB
        const video = await VideoModel.create({
            title: videoData.title,
            video: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`,
            thumbnail: thumbnailUrl,
            created_at: videoData.created_at || new Date(),
            videotype: videoData.videotype || 0,
            videoview: videoData.videoview || 0,
            videolike: videoData.videolike || 0,
            videodislike: videoData.videodislike || 0,
            videodescribe: videoData.videodescribe || '',
            status: videoData.status || 1,
            userid: videoData.userid
        });

        // Tạo thông báo cho subscriber
        try {
            // Lấy tên tài khoản
            const account = await AccountModel.findByPk(videoData.userid, {
                attributes: ['name']
            });
            if (!account) {
                console.error('Account not found for userid:', videoData.userid);
                throw new Error('Account not found');
            }

            // Lấy danh sách subscriber
            const subscribers = await SubscribeModel.findAll({
                where: { useridsub: videoData.userid },
                attributes: ['userid']
            });

            console.log('Subscribers found:', subscribers.map(s => s.userid));

            // Tạo thông báo
            const notifications = subscribers.map(sub => ({
                content: `${account.name} đã đăng video mới ${videoData.title}`,
                created_at: new Date(),
                status: 0,
                userid: sub.userid
            }));

            if (notifications.length > 0) {
                await NotificationModel.bulkCreate(notifications);
                console.log('Notifications created:', notifications.length);
            } else {
                console.log('No subscribers to notify');
            }
        } catch (notificationError) {
            console.error('Error creating notifications:', notificationError);
            // Không throw lỗi để không làm gián đoạn việc upload video
        }

        return video;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw new Error(`Failed to upload video: ${error.message}`);
    }
};

const getAllVideos = async (videotype = null, page = 1, limit = 50, excludeId = null, orderByView = false, search = null) => {
    console.log('Service: getAllVideos called'); // Debug
    try {
        const offset = (page - 1) * limit;

        const whereCondition = {
            status: 1,
            ...(videotype !== null && { videotype }),
            ...(excludeId && { videoid: { [Op.ne]: excludeId } }),
        };

        if (search) {
            const searchNum = parseInt(search);
            const searchConditions = [];
            if (!isNaN(searchNum)) {
                searchConditions.push({ videoid: searchNum });
            }
            searchConditions.push({ title: { [Op.like]: `%${search.replace(/[%_]/g, '\\$&')}%` } });
            whereCondition[Op.or] = searchConditions;
        }

        const orderCondition = orderByView
            ? [['videoview', 'DESC'], ['created_at', 'DESC'], ['videoid', 'DESC']]
            : [['created_at', 'DESC'], ['videoid', 'DESC']];

        console.log('Service: whereCondition:', JSON.stringify(whereCondition)); // Debug

        const { count, rows } = await VideoModel.findAndCountAll({
            where: whereCondition,
            include: [{
                model: AccountModel,
                attributes: ['userid', 'name', 'avatar'],
            }],
            order: orderCondition,
            limit,
            offset,
            logging: console.log // Log SQL query
        });

        return {
            status: 'OK',
            message: 'Lấy tất cả video thành công',
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    } catch (error) {
        console.error('❌ Service: Error fetching videos:', error.message, error.stack);
        return {
            status: 'ERROR',
            message: `Lấy tất cả video thất bại: ${error.message}`,
        };
    }
};

const getVideoById = async (videoid, userid) => {
    try {
        // Validate videoid
        const parsedVideoid = parseInt(videoid);
        if (isNaN(parsedVideoid) || parsedVideoid <= 0) {
            throw new Error('Invalid video ID');
        }

        // Kiểm tra xem bản ghi đã tồn tại trong bảng watched hay chưa
        if (userid) {
            const existingRecord = await WatchedModel.findOne({
                where: { userid: userid, videoid: parsedVideoid }
            });

            if (!existingRecord) {
                // Nếu không tồn tại, tạo bản ghi mới
                await WatchedModel.create({
                    userid: userid,
                    videoid: parsedVideoid,
                    created_at: new Date()
                });
            } else {
                // Nếu đã tồn tại, chỉ cập nhật created_at
                await existingRecord.update({ created_at: new Date() });
            }
        }

        // Tìm video theo videoid
        const video = await VideoModel.findOne({
            where: { videoid: parsedVideoid }, // Chỉ lấy video có status = 1
            include: [
                {
                    model: AccountModel,
                    attributes: ['userid', 'name', 'email', 'avatar', 'subscription'],
                },
                {
                    model: LikevideoModel,
                    attributes: [],
                    required: false,
                },
            ],
        });

        if (!video) {
            throw new Error('Video not found');
        }

        return video;
    } catch (error) {
        console.error(`❌ Service: Error fetching video by ID: ${error.message}`);
        throw error;
    }
};

const updateVideo = async (videoid, data) => {
    const video = await VideoModel.findByPk(videoid);
    if (video) {
        return await video.update(data);
    }
    throw new Error('Video not found');
};

const deleteVideo = async (videoid) => {
    const video = await VideoModel.findByPk(videoid);
    if (video) {
        await video.destroy();
        return true;
    }
    throw new Error('Video not found');
};

const searchVideos = async (query, sortBy, viewed, userid, page, limit) => {
    try {
        console.log(`🔍 Service: Searching videos with query=${query}, sortBy=${sortBy}, viewed=${viewed}, userid=${userid}, page=${page}, limit=${limit}`);

        // Kiểm tra tham số
        if (!query) {
            throw new Error('Thiếu tham số query.');
        }
        if (!['created_at', 'videoview'].includes(sortBy)) {
            throw new Error('Giá trị sortBy không hợp lệ.');
        }
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedLimit) || parsedLimit < 1) {
            throw new Error('Trang hoặc giới hạn không hợp lệ.');
        }
        if (viewed !== null && (!userid || isNaN(parseInt(userid)) || parseInt(userid) <= 0)) {
            throw new Error('ID người dùng không hợp lệ khi lọc video đã xem.');
        }

        // Xây dựng điều kiện tìm kiếm
        const searchConditions = {
            title: { [Op.like]: `%${query}%` },
            status: 1
        };

        // Xây dựng include cho AccountModel
        const include = [
            {
                model: AccountModel,
                attributes: ['userid', 'name', 'avatar', 'subscription'],
            }
        ];

        // Lọc video đã xem hoặc chưa xem
        if (viewed !== null && userid) {
            const viewedVideos = await WatchedModel.findAll({
                where: { userid: parseInt(userid) },
                attributes: ['videoid'],
                raw: true
            }).then(views => views.map(view => view.videoid));

            if (viewed) {
                // Lọc video đã xem
                if (viewedVideos.length === 0) {
                    return {
                        data: [],
                        total: 0,
                        page: parsedPage,
                        totalPages: 0
                    };
                }
                searchConditions.videoid = { [Op.in]: viewedVideos };
            } else {
                // Lọc video chưa xem
                if (viewedVideos.length > 0) {
                    searchConditions.videoid = { [Op.notIn]: viewedVideos };
                }
                // Nếu không có video đã xem, không cần thêm điều kiện (lấy tất cả video)
            }
        }

        // Xác định thứ tự sắp xếp
        const sortOptions = sortBy === 'videoview' ? [['videoview', 'DESC']] : [['created_at', 'DESC']];

        // Phân trang
        const offset = (parsedPage - 1) * parsedLimit;

        // Tìm kiếm video
        const { count, rows } = await VideoModel.findAndCountAll({
            where: searchConditions,
            include,
            order: sortOptions,
            offset,
            limit: parsedLimit,
            raw: true,
            nest: true,
            distinct: true,
            logging: console.log
        });

        // Log để kiểm tra kết quả
        console.log(`🔍 Service: Found ${rows.length} videos, total: ${count}, video IDs: ${rows.map(row => row.videoid).join(', ')}`);

        return {
            data: rows,
            total: count,
            page: parsedPage,
            totalPages: Math.ceil(count / parsedLimit)
        };
    } catch (error) {
        console.error('❌ Service: Error searching videos:', error.message);
        throw error;
    }
};

const incrementView = async (videoid) => {
    try {
        await VideoModel.increment('videoview', {
            where: { videoid: videoid }
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật lượt xem:", error);
        throw new Error("Không thể cập nhật lượt xem.");
    }
};

const getVideosByType = async (videotype, page = 1, limit = 50, excludeId = null) => {
    try {
        const offset = (page - 1) * limit;

        const whereCondition = {
            videotype,
            status: 1,
            ...(excludeId && { videoid: { [Op.ne]: excludeId } }) // Loại trừ video hiện tại nếu có
        };

        const { count, rows } = await VideoModel.findAndCountAll({
            where: whereCondition,
            include: [{
                model: AccountModel,
                attributes: ['userid', 'name', 'avatar'],
            }],
            order: [
                ['videoview', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit,
            offset,
        });

        return {
            status: 'OK',
            message: 'Lấy video theo type thành công',
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        };
    } catch (error) {
        console.error('Error fetching videos by type:', error);
        return {
            status: 'ERROR',
            message: 'Lấy video theo type thất bại',
        };
    }
};

const getVideosByUserId = async (userid, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;

    const videos = await VideoModel.findAll({
        where: { userid, status: 1 },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: AccountModel,
                attributes: ['name', 'email', 'avatar', 'subscription'],
            },
            {
                model: LikevideoModel,
                attributes: [],
                required: false,
            },
        ],
    });

    return videos;
};

const getMyVideos = async (userid, page = 1, limit = 20, status) => {
    const offset = (page - 1) * limit;

    const where = { userid };
    if (status !== undefined) {
        where.status = status;
    }

    const videos = await VideoModel.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [
            {
                model: AccountModel,
                attributes: ['name', 'email', 'avatar', 'subscription'],
            },
            {
                model: LikevideoModel,
                attributes: [],
                required: false,
            },
        ],
    });

    return videos;
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideos,
    incrementView,
    getVideosByType,
    getVideosByUserId,
    getMyVideos
};