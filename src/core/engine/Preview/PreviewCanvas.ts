import { ImageFilter, ImagePosition } from '@/core/multimedia-controller/types';

import { getImageFilterFn, getCoordinatesByPosition } from './libs';

export interface ObjectDraw {
    frame: VideoFrame;
    images?: Array<{ position: ImagePosition; image: ImageBitmap }>;
    appliedFilter?: ImageFilter;
}

export class PreviewCanvas {
    private canvas: OffscreenCanvas;
    private ctx: OffscreenCanvasRenderingContext2D;

    private width: number;
    private height: number;

    /**
     * Связывает экземпляр canvas с классом.
     *
     * @param {OffscreenCanvas} canvas - Экземпляр canvas, с которым связывается класс.
     */
    linkTo(canvas: OffscreenCanvas) {
        this.canvas = canvas;
        // @ts-ignore
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    /**
     * Рисует кадр, изображения (если есть) и применяет фильтр на canvas.
     *
     * @param {ObjectDraw} data - Данные для отрисовки, включая кадр, изображения и фильтр.
     */
    draw(data: ObjectDraw) {
        const { frame, images, appliedFilter } = data;

        this.clearScene();

        this.drawFrame(frame);
        this.drawImages(images);
        this.applyFilter(appliedFilter);
    }

    /**
     * Очищает сцену на canvas.
     */
    clearScene() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Рисует кадр на canvas.
     *
     * @param {VideoFrame} frame - Кадр для отрисовки.
     */
    private drawFrame(frame: ObjectDraw['frame']) {
        const { width, height } = this.resizeImageToCanvasProportions(frame.displayWidth, frame.displayHeight);
        const { x, y } = this.calculateCenteredImagePosition(width, height);

        this.ctx.drawImage(frame, x, y, this.width, this.height);
    }

    /**
     * Рисует изображения на canvas.
     *
     * @param {Array<{ position: ImagePosition; image: ImageBitmap }>} images - Массив изображений для отрисовки.
     */
    private drawImages(images: ObjectDraw['images']) {
        if (images == null || images.length === 0) return;

        images.forEach(segment => {
            const { image, position } = segment;
            const [x, y] = getCoordinatesByPosition(position, image.width, image.height, this.width, this.height);

            this.ctx.drawImage(image, x, y, image.width, image.height);
        });
    }

    /**
     * Применяет фильтр к изображению на canvas.
     *
     * @param {ImageFilter} appliedFilter - Фильтр для применения.
     */
    private applyFilter(appliedFilter: ObjectDraw['appliedFilter']) {
        if (appliedFilter == null || appliedFilter === 'none') return;

        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const filterFn = getImageFilterFn(appliedFilter);

        filterFn(imageData);
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Рассчитывает позицию изображения с центрированием на указанных размерах.
     *
     * @param {number} imageWidth - Ширина изображения.
     * @param {number} imageHeight - Высота изображения.
     * @returns {{ x: number, y: number }} - Объект с координатами x и y для центрирования изображения.
     */
    private calculateCenteredImagePosition(imageWidth: number, imageHeight: number): { x: number; y: number } {
        let newWidth, newHeight;

        if (imageWidth / this.width > imageHeight / this.height) {
            newWidth = this.width;
            newHeight = (imageHeight / imageWidth) * this.width;
        } else {
            newWidth = (imageWidth / imageHeight) * this.height;
            newHeight = this.height;
        }

        const x = (this.width - newWidth) / 2;
        const y = (this.height - newHeight) / 2;

        return { x, y };
    }

    /**
     * Изменяет размеры изображения с сохранением пропорций в пределах максимальной ширины и высоты.
     *
     * @param {number} imageWidth - Исходная ширина изображения.
     * @param {number} imageHeight - Исходная высота изображения.
     * @returns {{ width: number, height: number }} - Объект с новой шириной и высотой изображения.
     */
    private resizeImageToCanvasProportions(imageWidth: number, imageHeight: number): { width: number; height: number } {
        let width = imageWidth;
        let height = imageHeight;

        if (width > this.width || height > this.height) {
            const aspectRatio = width / height;

            if (width > this.width) {
                width = this.width;
                height = width / aspectRatio;
            }

            if (height > this.height) {
                height = this.height;
                width = height * aspectRatio;
            }
        }

        return { width, height };
    }
}
