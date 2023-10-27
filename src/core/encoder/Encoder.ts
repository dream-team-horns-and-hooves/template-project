import { Muxer } from '@/core/muxer';

/*
    https://stackoverflow.com/questions/70313774/webcodecs-videoencoder-create-video-from-encoded-frames
*/

interface EncoderOptions {
    width: number;
    height: number;
    bitrate: number;
}

export class Encoder {
    private muxer: Muxer;
    private videoEncoder: VideoEncoder;

    async initialize(options: EncoderOptions) {
        this.muxer = new Muxer(options);

        this.videoEncoder = new VideoEncoder({
            output: (chunk, meta) => {
                this.muxer.addVideoChunk(chunk, meta);
            },
            error: e => console.error(e),
        });

        /*
            avc1.42001f: (1984*1088=2158592) | max = 921600 пикселей, поддержка уровня AVC (3.1), который указан в кодеке.
            avc1.640028: (1984*1088=2158592) | max = 2097152 пикселей, поддержка уровня AVC (4.0), который указан в кодеке.
        */
        this.videoEncoder.configure({
            codec: 'avc1.640032',
            width: options.width,
            height: options.height,
            bitrate: options.bitrate,
        });
    }

    encodeVideoFrame(frame: VideoFrame, options?: VideoEncoderEncodeOptions) {
        this.videoEncoder.encode(frame, options);
    }

    async finish() {
        console.log('finish');

        await this.videoEncoder.flush();
        const buffer = this.muxer.finish();

        return buffer;
    }
}
