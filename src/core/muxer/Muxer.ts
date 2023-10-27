import { Muxer as VideoMuxer, ArrayBufferTarget } from 'mp4-muxer';

/*
    https://github.com/Vanilagy/mp4-muxer
*/

interface MuxerOptionsConstructor {
    width: number;
    height: number;
}

export class Muxer {
    muxer: VideoMuxer<ArrayBufferTarget>;

    constructor(options: MuxerOptionsConstructor) {
        this.muxer = new VideoMuxer({
            target: new ArrayBufferTarget(),
            video: {
                codec: 'avc',
                width: options.width,
                height: options.height,
            },
            // audio: {
            //     codec: 'opus',
            //     sampleRate: 48000,
            //     numberOfChannels: 2,
            // },
            // firstTimestampBehavior: 'offset',
        });
    }

    addVideoChunk(chunk: EncodedVideoChunk, meta: EncodedVideoChunkMetadata) {
        this.muxer.addVideoChunk(chunk, meta);
    }

    addAudioChunk(chunk: EncodedAudioChunk, meta?: EncodedAudioChunkMetadata, timestamp?: number) {
        this.muxer.addAudioChunk(chunk, meta);
    }

    finish() {
        this.muxer.finalize();
        return this.muxer.target.buffer;
    }
}
