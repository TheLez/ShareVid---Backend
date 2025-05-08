const VideoModel = require('./models/VideoModel');
const s3 = require('./awsConfig');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const uploadVideo = async (videoFile, thumbnailFile = null, videoData) => {
    const videoKey = `videos/${videoFile.originalname}`;
    const thumbnailKey = thumbnailFile ? `thumbnails/${thumbnailFile.originalname}` : null;

    // Upload video
    await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Key: videoKey,
        Body: videoFile.buffer,
        ContentType: videoFile.mimetype,
    }).promise();

    let thumbnailUrl = null;

    if (!thumbnailFile) {
        // Tạo thumbnail từ video
        const thumbnailPath = path.join(__dirname, 'temp-thumbnail.jpg');
        await new Promise((resolve, reject) => {
            ffmpeg(videoFile.buffer)
                .on('end', resolve)
                .on('error', reject)
                .screenshots({
                    timestamps: [1],
                    filename: 'temp-thumbnail.jpg',
                    folder: __dirname,
                    size: '320x240',
                });
        });

        // Upload thumbnail
        const thumbnailData = fs.readFileSync(thumbnailPath);
        await s3.upload({
            Bucket: process.env.S3_BUCKET,
            Key: thumbnailKey || 'thumbnails/temp-thumbnail.jpg',
            Body: thumbnailData,
            ContentType: 'image/jpeg',
        }).promise();
        thumbnailUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/thumbnails/temp-thumbnail.jpg`;

        // Xóa file tạm
        fs.unlinkSync(thumbnailPath);
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
        created_at: new Date(), // Hoặc sử dụng thư viện moment để định dạng
        videotype: videoData.videotype || null,
        videoview: videoData.videoview || 0,
        videolike: videoData.videolike || 0,
        videodislike: videoData.videodislike || 0,
        videodescribe: videoData.videodescribe || '',
        status: videoData.status,
        userid: videoData.userid || null,
    });

    return video;
};

// Các phương thức còn lại không thay đổi
const getAllVideos = async () => {
    return await VideoModel.findAll();
};

const getVideoById = async (videoid) => {
    return await VideoModel.findByPk(videoid);
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

module.exports = {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
};