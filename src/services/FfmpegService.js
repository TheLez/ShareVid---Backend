const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(require('ffmpeg-static'));

class FfmpegService {
    async processVideo({ videoPath, imagePaths, audioPath, params, outputPath }) {
        const { startTime, endTime, speed, volume, imagePropsArray, audioProps } = params;

        console.log('Processing video with params:', params);
        console.log('imagePaths:', imagePaths);
        console.log('imagePropsArray:', imagePropsArray);

        return new Promise((resolve, reject) => {
            const command = ffmpeg()
                .input(videoPath)
                .setStartTime(startTime || 0);

            const filterParts = [];
            let videoOutput = '0:v'; // Nhãn không bao gồm dấu ngoặc
            let audioOutput = '0:a'; // Nhãn không bao gồm dấu ngoặc

            // Xử lý video và chèn ảnh
            if (imagePaths && imagePaths.length > 0 && imagePropsArray && imagePropsArray.length > 0) {
                imagePaths.forEach((_, index) => {
                    if (index < imagePropsArray.length) {
                        command.input(imagePaths[index]);
                        const { x, y, width, height, startTime: imgStart, endTime: imgEnd } = imagePropsArray[index];
                        filterParts.push(`[${index + 1}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease[scaled${index}]`);
                    }
                });

                let currentVideoOutput = '0:v';
                imagePaths.forEach((_, index) => {
                    if (index < imagePropsArray.length) {
                        const { x, y, startTime: imgStart, endTime: imgEnd } = imagePropsArray[index];
                        filterParts.push(`[${currentVideoOutput}][scaled${index}]overlay=${x}:${y}:enable='between(t,${imgStart},${imgEnd})'[v${index}]`);
                        currentVideoOutput = `v${index}`; // Lưu nhãn không có dấu ngoặc
                    }
                });
                videoOutput = currentVideoOutput;
            }

            // Xử lý tốc độ video
            if (speed !== 1) {
                filterParts.push(`[${videoOutput}]setpts=PTS/${speed}[v_speed]`);
                videoOutput = 'v_speed';
                // Điều chỉnh tốc độ âm thanh gốc
                filterParts.push(`[0:a]atempo=${speed}[a_speed]`);
                audioOutput = 'a_speed';
            }

            // Xử lý âm thanh
            if (audioPath && audioProps) {
                command.input(audioPath);
                const audioIndex = (imagePaths ? imagePaths.length : 0) + 1;
                const { startTime: audioStart, endTime: audioEnd } = audioProps;

                // Resample âm thanh gốc
                filterParts.push(`[${audioOutput}]aresample=48000[a_original]`);
                // Trim và resample âm thanh bổ sung
                filterParts.push(`[${audioIndex}:a]atrim=start=${audioStart}:end=${audioEnd}[a_trimmed]`);
                filterParts.push(`[a_trimmed]aresample=48000[a_additional]`);
                // Trộn âm thanh
                filterParts.push(`[a_original][a_additional]amix=inputs=2:duration=first[a_mix]`);
                audioOutput = 'a_mix';
            } else {
                // Chỉ sử dụng âm thanh gốc
                filterParts.push(`[${audioOutput}]aresample=48000[a_original]`);
                audioOutput = 'a_original';
            }

            // Điều chỉnh âm lượng nếu cần
            if (volume !== 1) {
                filterParts.push(`[${audioOutput}]volume=${volume}[a_final]`);
                audioOutput = 'a_final';
            }

            if (filterParts.length > 0) {
                console.log('Filter parts:', filterParts);
                command.complexFilter(filterParts);
            }

            const outputOptions = [
                '-map', `[${videoOutput}]`,
                '-map', `[${audioOutput}]`,
                '-c:v', 'libx264',
                '-c:a', 'aac'
            ];

            if (endTime) {
                outputOptions.push('-t', (endTime - (startTime || 0)).toString());
            }

            command
                .outputOptions(outputOptions)
                .save(outputPath)
                .on('start', (commandLine) => {
                    console.log('▶ FFmpeg command:', commandLine);
                })
                .on('stderr', (stderrLine) => {
                    console.log('⚙ FFmpeg log:', stderrLine);
                })
                .on('end', () => {
                    console.log('✔ FFmpeg xử lý hoàn tất.');
                    resolve(outputPath);
                })
                .on('error', (err, stdout, stderr) => {
                    console.error('❌ FFmpeg error:', err.message);
                    console.error('STDERR:', stderr);
                    console.error('STDOUT:', stdout);
                    reject(err);
                });
        });
    }

    cleanUp(files) {
        files.forEach((file) => {
            if (file && fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    }
}

module.exports = new FfmpegService();