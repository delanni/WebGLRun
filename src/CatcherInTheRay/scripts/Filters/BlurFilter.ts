
module FILTERS {
    export interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }


    export class StackBlurFilter implements ICanvasFilter {
        _fullCanvas: boolean;
        _customRect: Rectangle;
        _radius: number;
        _useAlpha: boolean;

        constructor(radius: number, customRect?: Rectangle) {
            if (customRect) {
                this._fullCanvas = false;
                this._customRect = customRect;
            } else {
                this._fullCanvas = true;
            }

            this._useAlpha = true;
            this._radius = radius;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            if (this._fullCanvas) {
                if (!this._useAlpha) {
                    BLUR.stackBlurCanvasRGBFromCanvas(canvas, 0, 0, canvas.width, canvas.height, this._radius);
                } else {
                    BLUR.stackBlurCanvasRGBAFromCanvas(canvas, 0, 0, canvas.width, canvas.height, this._radius);
                }
            } else {
                if (!this._useAlpha) {
                    BLUR.stackBlurCanvasRGBFromCanvas(canvas, this._customRect.x, this._customRect.y, this._customRect.width, this._customRect.height, this._radius);
                } else {
                    BLUR.stackBlurCanvasRGBAFromCanvas(canvas, this._customRect.x, this._customRect.y, this._customRect.width, this._customRect.height, this._radius);
                }
            }
            return canvas;
        }
    }

    export function Upscale(canvas: HTMLCanvasElement,targetWidth:number, targetHeight:number): HTMLCanvasElement {
        var upscaled = CreateCanvas(targetWidth, targetHeight, false);
        var upscaledCtx = upscaled.getContext("2d");

        var originalContext = canvas.getContext("2d");
        var originalImgData = originalContext.getImageData(0, 0, canvas.width, canvas.height);

        upscaledCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetWidth, targetHeight);

        return upscaled;
    }
} 