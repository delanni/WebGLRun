module FILTERS {
    export class HistogramEqFilter implements ICanvasFilter {
        _customRect: Rectangle;
        _from: number;
        _to: number;
        _eqFactor: number;

        constructor(from: number, to: number, eqFactor: number = 1) {
            this._eqFactor = eqFactor;
            this._from = from;
            this._to = to;
        }

        Check(canvas: HTMLCanvasElement): boolean {
            return true;
        }

        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement {
            var maxGradient: number = 0;
            var minGradient: number = 0;

            var ctx = canvas.getContext("2d");
            var img = ctx.getImageData(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < img.data.length; i += 4) {
                var r = img.data[i] / 255.0;
                var g = img.data[i + 1] / 255.0;
                var b = img.data[i + 2] / 255.0;

                var gradient = r * 0.3 + g * 0.59 + b * 0.11;

                maxGradient = Math.max(gradient, maxGradient);
                minGradient = Math.min(gradient, minGradient);
            }

            var gradientRange = maxGradient - minGradient;
            var targetRange = this._to - this._from;

            for (var i = 0; i < img.data.length; i += 4) {
                var r = img.data[i] / 255.0;
                var g = img.data[i + 1] / 255.0;
                var b = img.data[i + 2] / 255.0;
                var gradient = r * 0.3 + g * 0.59 + b * 0.11;

                var normalized = Math.pow((gradient - minGradient) / gradientRange, this._eqFactor) * targetRange + this._from;
                img.data[i] = (normalized * 255) | 0;
                img.data[i + 1] = (normalized * 255) | 0;
                img.data[i + 2] = (normalized * 255) | 0;
            }

            ctx.putImageData(img, 0, 0);
            return canvas;
        }
    }
} 