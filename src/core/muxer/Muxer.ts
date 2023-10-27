import { Muxer as VideoMuxer, ArrayBufferTarget } from 'mp4-muxer';

/*
    https://github.com/Vanilagy/mp4-muxer
*/

export class Muxer {
    muxer: VideoMuxer<ArrayBufferTarget>;

    constructor(opts: any) {
        this.muxer = new VideoMuxer({
            target: new ArrayBufferTarget(),
            video: {
                codec: 'avc',
                width: 1280,
                height: 720,
            },
            // audio: {
            //     codec: 'opus',
            //     sampleRate: 48000,
            //     numberOfChannels: 2,
            // },
            firstTimestampBehavior: 'offset',
        });
    }

    addVideoChunk(chunk: EncodedVideoChunk, meta: EncodedVideoChunkMetadata) {
        this.muxer.addVideoChunk(chunk, meta);
    }

    addAChunk(chunk: any, meta: any) {
        this.muxer.addAudioChunk(chunk, meta);
    }

    finish() {
        this.muxer.finalize();
        return this.muxer.target.buffer;
    }
}
