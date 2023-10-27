import {PreviewCanvas} from './Preview';
import { Segments } from './Segments';
import { Engine } from './Engine';

import { Storage } from '../storage';

import type { WorkerEvents } from '@/core/multimedia-controller/types';

const previewCanvas = new PreviewCanvas();
const storage = new Storage();

const segments = new Segments(storage);

const engine = new Engine({
    canvas: previewCanvas,
    segments,
});

segments.onVideoAdded(data => {
    self.postMessage({ type: 'RENDER_VIDEO_FRAGMENT', payload: data });
});

segments.onImageAdded(data => {
    self.postMessage({ type: 'RENDER_IMAGE_FRAGMENT', payload: { id: data } });
});

segments.onTimePositionUpdated(data => {
    console.log(data)
    self.postMessage({ type: 'RECALCULATE_TIME', payload: { times: data } });
});

self.onmessage = async function (event: MessageEvent<WorkerEvents>) {
    const { type, payload } = event.data;

    switch (type) {
        case 'INITIALIZATION': {
            console.log('INITIALIZATION');
            previewCanvas.linkTo(payload.canvas);
            break;
        }
        case 'ADD_VIDEO': {
            console.log('ADD_VIDEO', payload);
            segments.parseMediaSegment(payload.buffer);
            break;
        }
        case 'ADD_IMAGE': {
            console.log('ADD_IMAGE', payload);
            segments.createImageSegment(payload.videoId, payload.blob);
            break;
        }
        case 'CHANGE_IMAGE_POSITION': {
            console.log('CHANGE_IMAGE_POSITION', payload);
            segments.changeImagePosition(payload.imageId, payload.position);
            break;
        }
        case 'PLAY': {
            console.log('PLAY');
            engine.start();
            break;
        }
        case 'PAUSE': {
            console.log('PAUSE');
            engine.pause();
            break;
        }
        case 'SWITCH_VISIBILITY_STATE': {
            console.log('SWITCH_VISIBILITY_STATE', payload);
            segments.changeDisplayOrder(payload.videoId);
            break;
        }
        case 'APPLY_FILTER_TO_VIDEO': {
            console.log('APPLY_FILTER_TO_VIDEO', payload);
            segments.changeVideoSegmentFilter(payload.videoId, payload.filter);
            break;
        }
        case 'GET_PREVIEW_FRAME_FROM_SELECTED_VIDEO': {
            console.log('GET_PREVIEW_FRAME_FROM_SELECTED_VIDEO', payload);
            engine.showPreview(payload.videoId, payload.timestamp);
            break;
        }
        case 'EXPORT': {
            console.log('EXPORT', payload);
            // engine.test();

            // builder.init(videoSegments, imageSegments, storage);

            // const result: ArrayBuffer = await builder.start();

            // self.postMessage({
            //     type: 'FINISH',
            //     payload: {
            //         buffer: result,
            //     },
            // });
            break;
        }
        default:
            break;
    }
};
