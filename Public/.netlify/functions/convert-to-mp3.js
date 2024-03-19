const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

exports.handler = async (event, context) => {
    try {
        const pathSegments = event.path.split('/');
        const videoId = pathSegments[pathSegments.length - 1];
 
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Download video using ytdl-core
        const videoStream = ytdl(videoUrl);
        const info = await ytdl.getInfo(videoId);
    
        // Extract necessary video information
        const title = info.videoDetails.title;
        const encodedFilename = encodeURIComponent(title);
        
        // Convert video to MP3 using fluent-ffmpeg
        const ffmpegCommand = ffmpeg(videoStream)
            .format('mp3')
            .on('error', (err) => {
                console.error('FFmpeg conversion error:', err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to convert video to MP3' })
                };
            })
            .outputOptions('-vn'); // Disable video stream output
        
        // Pipe MP3 data to response
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${encodedFilename}.mp3"`
            },
            body: ffmpegCommand
        };

        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
