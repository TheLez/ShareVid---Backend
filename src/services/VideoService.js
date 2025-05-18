require('dotenv').config();
const {
    sequelize,
    VideoModel,
    AccountModel,
    CommentModel,
    LikevideoModel,
    SubscribeModel,
    WatchedModel,
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
            userid: videoData.userid || null,
        });

        return video;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw new Error('Failed to upload video');
    }
};

// Các phương thức còn lại không thay đổi
const getAllVideos = async (videotype = null, page = 1, limit = 50, excludeId = null, orderByView = false) => {
    try {
        const offset = (page - 1) * limit;

        const whereCondition = {
            status: 1, // Chỉ lấy video đang hoạt động
            ...(videotype !== null && { videotype }), // Nếu có videotype, thêm vào điều kiện
            ...(excludeId && { videoid: { [Op.ne]: excludeId } }) // Loại trừ video hiện tại nếu có
        };

        const orderCondition = orderByView
            ? [['videoview', 'DESC'], ['created_at', 'DESC'], ['videoid', 'DESC']] // Sắp xếp theo lượt xem trước, sau đó theo ngày tạo
            : [['created_at', 'DESC'], ['videoid', 'DESC']]; // Mặc định sắp xếp theo ngày tạo mới nhất

        const { count, rows } = await VideoModel.findAndCountAll({
            where: whereCondition,
            include: [{
                model: AccountModel,
                attributes: ['userid', 'name', 'avatar'],
            }],
            order: orderCondition,
            limit,
            offset,
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
        console.error('Error fetching all videos:', error);
        return {
            status: 'ERROR',
            message: 'Lấy tất cả video thất bại',
        };
    }
};

const getVideoById = async (videoid, userid) => {
    // Kiểm tra xem bản ghi đã tồn tại trong bảng watched hay chưa
    const existingRecord = await WatchedModel.findOne({
        where: { userid: userid, videoid: videoid }
    });

    if (!existingRecord) {
        // Nếu không tồn tại, tạo bản ghi mới
        await WatchedModel.create({
            userid: userid,
            videoid: videoid,
            // Không cần thêm created_at vì đã có defaultValue
        });
    } else {
        // Nếu đã tồn tại, chỉ cập nhật created_at
        await existingRecord.update({ created_at: new Date() });
    }

    // Tìm video theo videoid
    const video = await VideoModel.findOne({
        where: { videoid: videoid, status: 1 }, // Chỉ lấy video có status = 1
        include: [
            {
                model: AccountModel,
                attributes: ['userid', 'name', 'email', 'avatar', 'subscription'], // Thêm subscription
            },
            {
                model: LikevideoModel,
                attributes: [], // Không lấy cụ thể
                required: false,
            },
        ],
    });

    return video;
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

const searchVideoByTitle = async (title, page = 1, limit = 50) => {
    try {
        const offset = (page - 1) * limit; // Tính toán offset

        const { count, rows } = await VideoModel.findAndCountAll({
            where: {
                title: {
                    [Op.like]: `%${title}%`, // Sử dụng LIKE để tìm kiếm
                },
                status: 1, // Chỉ lấy video có status = 1
            },
            limit: limit,
            offset: offset,
        });

        return {
            status: 'OK',
            message: 'Tìm kiếm video thành công',
            data: rows,
            total: count, // Tổng số video
            page: page,
            totalPages: Math.ceil(count / limit), // Tổng số trang
        };
    } catch (error) {
        throw new Error('Lỗi khi tìm kiếm video: ' + error.message);
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
            ], // Sắp xếp mới nhất trước
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


module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideoByTitle,
    incrementView,
    getVideosByType,
    getVideosByUserId
};