import { Muxer } from '@/core/muxer';

/*
    https://stackoverflow.com/questions/70313774/webcodecs-videoencoder-create-video-from-encoded-frames
*/

export class Encoder {
    private muxer: Muxer;
    encoder: VideoEncoder;
    audioEncoder: AudioEncoder;
    audioDecoder: AudioDecoder;

    decodedAudioFrames: any = [];

    constructor() {}

    async initialize(decodeOpts: any, opts: any) {
        this.muxer = new Muxer({});

        this.encoder = new VideoEncoder({
            output: (chunk, meta) => {
                this.muxer.addVideoChunk(chunk, meta);
            },

            error: e => console.error(e),
        });

        /*
            avc1.42001f: (1984*1088=2158592) | max = 921600 пикселей, поддержка уровня AVC (3.1), который указан в кодеке.
            avc1.640028: (1984*1088=2158592) | max = 2097152 пикселей, поддержка уровня AVC (4.0), который указан в кодеке.
        */
        this.encoder.configure({
            codec: 'avc1.640032',
            width: 1280,
            height: 720,
            bitrate: 15e6,
        });
    }

    encode(a: any, b: any) {
        this.encoder.encode(a, b);
    }

    async finish() {
        console.log('ENC FIN');
        await this.encoder.flush();
        this.muxer.finish();

        return this.muxer.muxer.target.buffer;
    }
}
