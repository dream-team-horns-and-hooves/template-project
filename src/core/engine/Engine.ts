import type { PreviewCanvas } from './Preview';

import { ImageFilter, ImagePosition } from '../multimedia-controller/types';

import type { Segments } from './Segments';
import { ObjectDraw } from '@/core/engine/Preview';
import { SegmentEngine, VideoSegmentInfo } from './Segments/Segments';

interface Options {
    canvas: PreviewCanvas;
    segments: Segments;
}

type WhatFrame = 'last' | 'current';

class VideoFrameQueue {
    decodedFrames: VideoFrame[] = [];
    lastDecodedFrame: VideoFrame | null = null;

    append(frame: VideoFrame): void {
        this.decodedFrames.push(frame);

        if (this.lastDecodedFrame) {
            this.lastDecodedFrame.close();
        }
    }

    take(): VideoFrame {
        const frame = this.decodedFrames.shift();
        this.lastDecodedFrame = frame;

        return frame;
    }

    takeLastDecodedFrame() {
        return this.lastDecodedFrame;
    }

    clear() {
        this.decodedFrames = [];

        if (this.lastDecodedFrame) {
            this.lastDecodedFrame.close();
            this.lastDecodedFrame = null;
        }
    }
}

type VideoSegmentStatus = 'fulled' | 'sliced';

class Trace {
    private lastKeyFrameIdx: number = 0;
    private lastFrameIdx: number = 0;
    private endFrameIdx: number;

    private status: VideoSegmentStatus = 'fulled';

    constructor(totalChunks: number) {
        this.endFrameIdx = totalChunks - 1;
    }

    setTraceTrack(keyIdx: number, idx: number) {
        this.status = 'sliced';
        this.lastKeyFrameIdx = keyIdx;
        this.lastFrameIdx = idx;
    }

    setLastTrackPont(idx: number) {
        this.lastFrameIdx = idx;
    }

    getStatus() {
        return this.status;
    }

    lastProcessingTrack() {
        return {
            start: this.lastKeyFrameIdx,
            past: this.lastFrameIdx,
            end: this.endFrameIdx,
        };
    }

    watchingMovementTrace(type: 'key' | 'delta', idx: number) {
        if (type === 'key') {
            this.lastKeyFrameIdx = idx;
        }

        this.lastFrameIdx = idx;
    }

    resetTrace() {
        this.status = 'fulled';
        this.lastKeyFrameIdx = 0;
        this.lastFrameIdx = 0;
    }
}

class TraceSegments {
    traces: Map<string, Trace> = new Map();

    create(videoInfo: VideoSegmentInfo) {
        const { id, totalChunks } = videoInfo;
        const trace = new Trace(totalChunks);

        this.traces.set(id, trace);
    }

    getTrace(videoId: string) {
        return this.traces.get(videoId);
    }

    setNewTrackTrace(videoId: string, track: { keyIdx: number; idx: number }) {
        const trace = this.getTrace(videoId);

        trace.setTraceTrack(track.keyIdx, track.idx);
        this.resetTraceExcept(videoId);
    }

    resetTraceExcept(videoId: string) {
        Array.from(this.traces.keys()).forEach(id => {
            if (id !== videoId) {
                this.getTrace(id).resetTrace();
            }
        });
    }

    resetTraces() {
        Array.from(this.traces.values()).forEach(trace => trace.resetTrace());
    }
}

type EngineStatus = 'pending' | 'playing' | 'pausing' | 'show-preview';

export class Engine {
    /*
     ****
     */
    canvas: PreviewCanvas;
    segments: Segments;
    traces: TraceSegments;

    /*
     *****
     */
    lastStatus: EngineStatus | null = null;
    status: EngineStatus = 'pending';

    queue: VideoFrameQueue;
    currentPlayingVideoId: string = null;

    constructor({ canvas, segments }: Options) {
        this.canvas = canvas;
        this.segments = segments;

        this.queue = new VideoFrameQueue();
        this.traces = new TraceSegments();

        /*
            Подписка на добавление сегментов
        */
        this.segments.onVideoAdded(data => this.traces.create(data));
        this.segments.onImageAdded(() => this.renderFromLastSavedFrame());

        /*
            Подписка на изменение сегментов
        */
        this.segments.onImagePositionChange(() => this.renderFromLastSavedFrame());
        this.segments.onFilterChange(() => this.renderFromLastSavedFrame());

        /*
            Подписка на изменение последовательности видео
        */
        this.segments.onOrderChanged(() => this.renderRollBack());
    }

    /*
     ****
     */
    private getCurrentVideoSegmentById(videoId: string) {
        return this.segments.getVideoSegmentById(videoId);
    }

    private setCurrentPlayingVideoId(videoId: string) {
        this.currentPlayingVideoId = videoId;
    }

    /*
     ***** Render
     */
    private async renderFirstFrameOfLeadingVideo(videoId: string) {
        this.setCurrentPlayingVideoId(videoId);

        const segments = this.getCurrentVideoSegmentById(videoId);
        const engine = segments.getEngine();

        engine.frameChannel((frame: VideoFrame) => {
            this.queue.append(frame);
            this.drawScene();
        });

        engine.decoder.decode(engine.chunksWorker.firstChunk);
        await engine.decoder.flush();
    }

    /*
     ***** Render
     */
    private async renderPreviewFrameFromSelectedVideo(videoId: string, timestamp: number) {
        const segment = this.getCurrentVideoSegmentById(videoId);
        const engine = segment.getEngine();

        const currentFrameIdx = engine.chunksWorker.findClosestFrameIdxByTimestamp(timestamp);
        const keyIdx = engine.chunksWorker.findKeyChunkByIndex(currentFrameIdx);

        const timestampPreviewFrame = engine.chunksWorker.chunks[currentFrameIdx].timestamp;
        const chunks = engine.chunksWorker.slice(keyIdx, currentFrameIdx + 1);

        this.traces.setNewTrackTrace(videoId, { keyIdx, idx: currentFrameIdx });

        console.log('this.traces', this.traces)

        engine.frameChannel((frame: VideoFrame) => {
            if (timestampPreviewFrame === frame.timestamp) {
                this.queue.append(frame);
                this.drawScene();
            } else {
                frame.close();
            }
        });

        let idx = 0;

        for (const chunk of chunks) {
            engine.decoder.decode(chunk);
            idx += 1;
        }

        await engine.decoder.flush();
    }

    /*
     ***** Render
     */
    private renderRollBack() {
        this.setStatus('pending');

        const order = this.segments.getDisplayOrder();

        if (order.length > 0) {
            this.renderFirstFrameOfLeadingVideo(order[0]);
        } else {
            this.idle();
        }

        this.traces.resetTraces();
    }

    /*
     ***** Render
     */
    private renderFromLastSavedFrame() {
        this.drawScene('last');
    }

    /*
     *****
     */
    private drawScene(whatFrame: WhatFrame = 'current') {
        console.log(`%c currentPlayingVideoId ${this.currentPlayingVideoId}`, 'color: green;');

        const images = this.segments.getImageSegmentsByVideoId(this.currentPlayingVideoId);
        const imageFilter = this.segments.getFilterByVideoId(this.currentPlayingVideoId);

        let frame = null;

        if (whatFrame === 'last') {
            frame = this.queue.lastDecodedFrame;
        } else {
            frame = this.queue.take();
        }

        // console.group('Draw Object');
        // console.log('frame --------->', frame.timestamp);
        // console.log('imageFilter --->', imageFilter);
        // console.log('images -------->', images);
        // console.groupEnd();

        const drawingObject: ObjectDraw = { frame, images, appliedFilter: imageFilter };

        this.canvas.draw(drawingObject);
    }

    /*
     *****
     */
    private setStatus(newStatus: EngineStatus) {
        this.lastStatus = this.status;
        this.status = newStatus;
    }

    idle() {
        this.canvas.clearScene();
        this.queue.clear();
    }

    /*
     *****
     */

    showPreview(videoId: string, timestamp: number) {
        console.log('showPreview', videoId);
        this.setStatus('show-preview');
        this.setCurrentPlayingVideoId(videoId);

        this.renderPreviewFrameFromSelectedVideo(videoId, timestamp);
    }

    /*
     *****
     */

    private selectVideoIdThatHasAlreadyBeenSelected() {
        return this.currentPlayingVideoId;
    }

    private selectVideoIdThatIsNextInOrder() {
        const order = this.segments.getDisplayOrder();
        const currentVideoIdIdx = order.findIndex(id => id === this.currentPlayingVideoId);
        const nextVideoId = order[currentVideoIdIdx + 1];

        if (nextVideoId) {
            this.setCurrentPlayingVideoId(nextVideoId);
            return nextVideoId;
        }

        return null;
    }

    /*
     *****
     */
    start() {
        if (this.status === 'playing') return

        this.setStatus('playing');

        if (this.currentPlayingVideoId == null) return;

        const currentVideoId = this.selectVideoIdThatHasAlreadyBeenSelected();

        this.renderMainFlow(currentVideoId);
    }

    pause() {
        if (this.status !== 'pausing') {
            this.setStatus('pausing');
        }
    }

    continue() {
        console.log('CONTINUE', this.status, this.isPausing, this.isShowPreview);
        if (this.isPausing || this.isShowPreview) return;

        const currentVideoId = this.selectVideoIdThatIsNextInOrder();

        if (currentVideoId == null) {
            this.setStatus('pending');
            return;
        }

        this.renderMainFlow(currentVideoId);
    }

    async renderMainFlow(videoId: string) {
        console.log('================renderMainFlow===================== videoId', videoId);

        const segments = this.getCurrentVideoSegmentById(videoId);
        const trace = this.traces.getTrace(videoId);

        const traceStatus = trace.getStatus();
        const engine = segments.getEngine();

        if (traceStatus === 'fulled') {
            await this.renderIfPlaybackStartsWithFulledVideo(engine, trace);
        } else {
            await this.renderIfPlaybackStartsWithSlicedVideo(engine, trace);
        }

        if (this.isPausing || this.isShowPreview) return;
        this.continue();
    }

    get shouldPlaybackStop() {
        return this.status === 'show-preview' || this.status === 'pending';
    }

    get isPausing() {
        return this.status === 'pausing';
    }

    get isPending() {
        return this.status === 'pending';
    }

    get isShowPreview() {
        return this.status === 'show-preview';
    }

    async renderIfPlaybackStartsWithFulledVideo(engine: SegmentEngine, trace: Trace) {
        const track = trace.lastProcessingTrack();
        const chunks = engine.chunksWorker.slice(track.start, track.end + 1);

        console.log(trace, trace.lastProcessingTrack());

        console.log('---------------> full video <---------------');

        engine.frameChannel((frame: VideoFrame) => {
            this.queue.append(frame);
            this.drawScene();
        });

        for (let idx = 0; idx < chunks.length; idx += 1) {
            if (this.shouldPlaybackStop) return;
            if (idx + track.start < track.past) continue;

            const chunk = chunks[idx];

            trace.watchingMovementTrace(chunk.type, idx + track.start);

            if (this.isPausing) {
                console.log('pausing');
                trace.setLastTrackPont(idx + track.start);
                return;
            }

            engine.decoder.decode(chunk);
            await new Promise(res => setTimeout(res, 1000 / 30));
        }

        await engine.decoder.flush();
    }

    async renderIfPlaybackStartsWithSlicedVideo(engine: SegmentEngine, trace: Trace) {
        const track = trace.lastProcessingTrack();
        const chunks = engine.chunksWorker.slice(track.start, track.end + 1);
        console.log(track)
        const lastTimestampFrame = engine.chunksWorker.chunks[track.past].timestamp;

        console.log('---------------> slice <---------------', lastTimestampFrame);

        engine.frameChannel((frame: VideoFrame) => {
            if (frame.timestamp > lastTimestampFrame) {
                this.queue.append(frame);
                this.drawScene();
            } else {
                frame.close();
            }
        });

        console.log('chunks', chunks)

        for (let idx = 0; idx < chunks.length; idx += 1) {
            if (this.shouldPlaybackStop) {
                return
            };

            if (idx + track.start < track.past) {
                if (this.lastStatus === 'show-preview') {
                    engine.decoder.decode(chunks[idx]);
                }

                continue;
            }

            const chunk = chunks[idx];

            trace.watchingMovementTrace(chunk.type, idx + track.start);

            if (this.isPausing || this.isShowPreview) {
                console.log('pausing');
                trace.setLastTrackPont(idx + track.start);
                return;
            }

            engine.decoder.decode(chunk);
            await new Promise(res => setTimeout(res, 1000 / 30));
        }

        await engine.decoder.flush();
    }
}
