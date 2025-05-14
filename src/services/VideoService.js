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
            created_at: new Date(),
            videotype: videoData.videotype || 0,
            videoview: videoData.videoview || 0,
            videolike: videoData.videolike || 0,
            videodislike: videoData.videodislike || 0,
            videodescribe: videoData.videodescribe || '',
            status: videoData.status,
            userid: videoData.userid || null,
        });

        return video;
    } catch (error) {
        console.error('Error uploading video:', error);
        throw new Error('Failed to upload video');
    }
};

// Các phương thức còn lại không thay đổi
const getAllVideos = async () => {
    try {
        const videos = await VideoModel.findAll({
            include: [{
                model: AccountModel,
                as: 'User', // Giả sử bạn đã đặt tên alias là 'User' trong định nghĩa model
                attributes: ['userid', 'name', 'avatar'], // Chọn các thuộc tính của người dùng cần lấy
            }],
        });

        return {
            status: 'OK',
            message: 'Lấy tất cả video thành công',
            data: videos,
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

    if (existingRecord) {
        // Nếu đã tồn tại, cập nhật created_at thành thời gian hiện tại
        await existingRecord.update({ created_at: new Date() });
    } else {
        // Nếu không tồn tại, tạo bản ghi mới
        await WatchedModel.create({
            userid: userid,
            videoid: videoid,
            // Không cần thêm created_at vì đã có defaultValue
        });
    }

    // Tìm video theo videoid
    const video = await VideoModel.findOne({
        where: { videoid: videoid },
        include: [
            {
                model: AccountModel,
                attributes: ['name', 'email', 'avatar', 'subscription'], // Thêm subscription
            },
            {
                model: CommentModel,
                include: [
                    {
                        model: AccountModel,
                        attributes: ['userid', 'name', 'email', 'avatar'],
                    },
                ],
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

const searchVideoByTitle = async (title) => {
    try {
        const videos = await VideoModel.findAll({
            where: {
                title: {
                    [Op.like]: `%${title}%`, // Sử dụng LIKE để tìm kiếm
                },
            },
        });
        return videos;
    } catch (error) {
        throw new Error('Lỗi khi tìm kiếm video: ' + error.message);
    }
};

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    searchVideoByTitle
};