import type {
    ClientEventTypes,
    WorkerEventTypes,
    ClientEvents,
    Quality,
    AddImageEvent,
    ImagePositionEvent,
    FinishTimeEvent,
    PreviewEventPayload,
    FilterEventPayload,
    RenderVideoFragmentEvent,
    RecalculateTimeEvent,
    RenderImageFragmentEvent,
    PlaybackTimeEvent,
} from '@/core';

type ClientCallback<T> = (payload: T) => void;

export class MultimediaController {
    private worker: Worker;
    private callbacks: Map<ClientEventTypes, ClientCallback<unknown>> = new Map();

    private initialized: boolean = false;

    constructor() {
        this.worker = new Worker(new URL('@/core/engine/worker', import.meta.url));

        this.worker.onmessage = (event: MessageEvent<ClientEvents>) => {
            const { type, payload } = event.data;

            if (this.callbacks.has(type)) {
                const cb = this.callbacks.get(type);
                cb(payload);
            }
        };
    }

    private sendMessageToWorker<T>(type: WorkerEventTypes, data: T = null, transferableObjects?: Transferable[]) {
        if (this.initialized) {
            this.worker.postMessage({ type, payload: data }, transferableObjects);
        }
    }

    /*
        События
    */

    public initialization(offscreenCanvas: OffscreenCanvas) {
        this.initialized = true;
        this.sendMessageToWorker('INITIALIZATION', { canvas: offscreenCanvas }, [offscreenCanvas]);
    }

    public play() {
        this.sendMessageToWorker('PLAY');
    }

    public pause() {
        this.sendMessageToWorker('PAUSE');
    }

    public preview(data: PreviewEventPayload) {
        this.sendMessageToWorker('GET_PREVIEW_FRAME_FROM_SELECTED_VIDEO', data);
    }

    public applyFilter(data: FilterEventPayload) {
        this.sendMessageToWorker('APPLY_FILTER_TO_VIDEO', data);
    }

    public addVideo(videoBuffer: ArrayBuffer) {
        this.sendMessageToWorker('ADD_VIDEO', { buffer: videoBuffer });
    }

    public addImage(imageData: AddImageEvent['payload']) {
        this.sendMessageToWorker('ADD_IMAGE', imageData);
    }

    public changeImagePosition(imagePositionData: ImagePositionEvent['payload']) {
        this.sendMessageToWorker('CHANGE_IMAGE_POSITION', imagePositionData);
    }

    public export(quality: Quality = '720р') {
        this.sendMessageToWorker('EXPORT', { quality });
    }

    public switchVisibility(videoId: string) {
        this.sendMessageToWorker('SWITCH_VISIBILITY_STATE', { videoId });
    }

    /*
        Подписки
    */

    onRenderVideoSegment(cb: ClientCallback<RenderVideoFragmentEvent['payload']>) {
        this.callbacks.set('RENDER_VIDEO_FRAGMENT', cb);
    }

    onRenderImageSegment(cb: ClientCallback<RenderImageFragmentEvent['payload']>) {
        this.callbacks.set('RENDER_IMAGE_FRAGMENT', cb);
    }

    onRecalculateTimeAfterChangeVisibility(cb: ClientCallback<RecalculateTimeEvent['payload']>) {
        this.callbacks.set('RECALCULATE_TIME', cb);
    }

    onPlaybackTime(cb: ClientCallback<PlaybackTimeEvent['payload']>) {
        this.callbacks.set('PLAYBACK_TIME', cb);
    }

    onFinish(cb: ClientCallback<FinishTimeEvent['payload']>) {
        this.callbacks.set('FINISH', cb);
    }
}