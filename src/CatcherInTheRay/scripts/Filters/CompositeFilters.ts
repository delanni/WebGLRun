module FILTERS {

    /**
    * This filter overwrites the target canvas' area with the parameter's data.
    **/
    export class CopyOverwriteFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;

        constructor(paramCanvas: HTMLCanvasElement) {
            this._paramCanvas = paramCanvas;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            //var paramCtx = this._paramCanvas.getContext("2d");
            //var paramImgData = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height);

            var targetCtx = canvas.getContext("2d");
            //var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            targetCtx.drawImage(this._paramCanvas, 0, 0, canvas.width, canvas.height);

            return canvas;
        }
    }

    /**
    * This filter copies the param data byte to byte and adds it to the target.
    **/
    export class AdditiveCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;

        constructor(paramCanvas: HTMLCanvasElement) {
            this._paramCanvas = paramCanvas;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                targetImgData.data[ix] = Math.min((targetImgData.data[ix] + paramPixels[ix]), 255) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        }
    }

    export class InverseAdditiveCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;

        constructor(paramCanvas: HTMLCanvasElement) {
            this._paramCanvas = paramCanvas;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                targetImgData.data[ix] = Math.min((targetImgData.data[ix] + (255-paramPixels[ix])), 255) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        }
    }
    /**
    * This filter copies the param data byte to byte and substracts it from the target (except for the alpha value);
    **/
    export class SubstractiveCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;

        constructor(paramCanvas: HTMLCanvasElement) {
            this._paramCanvas = paramCanvas;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                if (ix % 4 == 3) continue;
                targetImgData.data[ix] = Math.max((targetImgData.data[ix] - paramPixels[ix]), 0) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        }
    }

    export class DarknessCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;

        constructor(paramCanvas: HTMLCanvasElement) {
            this._paramCanvas = paramCanvas;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;

            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);

            for (var ix = 0; ix < paramPixels.length; ix++) {
                if (ix % 4 == 3) continue;
                targetImgData.data[ix] = Math.max((targetImgData.data[ix] - (255 - paramPixels[ix])), 0) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);

            return canvas;
        }
    }

    /**
    * This filter takes the canvas, and blurs it, while feeding itself back, so that the original image is copied back
    **/
    export class BleedFeed implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        _isDarkFeed: boolean;
        _blurriness: number;
        _iterations: number;

        constructor(paramCanvas: HTMLCanvasElement, blurRadius: number, iterations: number, darkfeed: boolean = false) {
            this._paramCanvas = paramCanvas;
            this._isDarkFeed = darkfeed;
            this._blurriness = blurRadius;
            this._iterations = iterations;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            var backup = document.createElement("canvas");
            backup.width = canvas.width;
            backup.height = canvas.height;

            // backup
            var copyFilter = new FILTERS.CopyOverwriteFilter(canvas);
            copyFilter.Apply(backup);

            var blurFilter = new FILTERS.StackBlurFilter(this._blurriness);
            var darkFeedback = new FILTERS.DarknessCopyFilter(backup);
            var lightFeedback = new FILTERS.AdditiveCopyFilter(backup);

            for (var i = 0; i < this._iterations; i++) {
                blurFilter.Apply(canvas);
                if (this._isDarkFeed) {
                    darkFeedback.Apply(canvas);
                } else {
                    lightFeedback.Apply(canvas);
                }
            }

            return canvas;
        }
    }
} 