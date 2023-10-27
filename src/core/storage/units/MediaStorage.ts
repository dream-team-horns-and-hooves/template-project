import { AudioTrackInfo, VideoTrackInfo } from '@/core/types/demuxer';
import { Decoder } from '@/core/decoder';
import type { DecodedVideoFramesResultFn, DecodedAudioFramesResultFn } from '@/core/types/decoder';

export class MediaStorage {
    private decoder: Decoder;

    private video: VideoTrackInfo;
    private audio: AudioTrackInfo;

    onVideoFrames: (callback: DecodedVideoFramesResultFn) => void;
    onAudioFrames: (callback: DecodedAudioFramesResultFn) => void;

    constructor(buffer: ArrayBuffer) {
        this.decoder = new Decoder(buffer);

        this.onVideoFrames = this.decoder.onVideoFrames.bind(this.decoder);
        this.onAudioFrames = this.decoder.onAudioFrames.bind(this.decoder);
    }

    async initialization() {
        await this.retrieveVideoAudioInfo();
        return this;
    }

    async retrieveVideoAudioInfo() {
        const media = await this.decoder.setupMedia();

        this.video = media.video;
        this.audio = media.audio;

        return media;
    }

    async retrieveVideoChunks() {
        return await this.decoder.getReadyVideoChunks();
    }

    async retrieveAudioChunks() {
        return await this.decoder.getReadyAudioChunks();
    }

    get videoDecoder() {
        return this.decoder.getVideoDecoder();
    }

    get videoInfo() {
        return this.video;
    }

    get audioInfo() {
        return this.audio;
    }
}
