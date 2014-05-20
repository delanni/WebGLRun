// CREDITS to Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/generators/perlinnoise.js
// Modified by Alex Szabo


module TERRAIN {
    export interface NoiseParameters {
        random: RandomProvider;
        width?: number;
        height?: number;
        canvas?: HTMLCanvasElement;
        param?: number;
        displayCanvas?: boolean;
    }

    export class PerlinNoiseGenerator {

        public Canvas: HTMLCanvasElement;
        public Parameters: NoiseParameters;
        public Random: RandomProvider;

        private randomNoise(separateCanvas: boolean, displayCanvas: boolean) {
            var noiseCanvas = separateCanvas ?
                CreateCanvas(this.Parameters.width, this.Parameters.height, displayCanvas) :
                this.Canvas;

            var g = noiseCanvas.getContext("2d"),
                imageData = g.getImageData(0, 0, noiseCanvas.width, noiseCanvas.height),
                pixels = imageData.data;

            for (var i = 0; i < pixels.length; i += 4) {
                pixels[i] = pixels[i + 1] = pixels[i + 2] = (this.Random.Random() * 256) | 0;

                pixels[i + 3] = 255;
            }

            g.putImageData(imageData, 0, 0);
            return noiseCanvas;
        }

        constructor(inParameters: NoiseParameters) {
            /**
             * This part is based on the snippest :
             * https://gist.github.com/donpark/1796361
             */

            inParameters.param = inParameters.param || 1.1;
            inParameters.width = inParameters.width || 640;
            inParameters.height = inParameters.height || 480;

            if (!inParameters.canvas) {
                inParameters.canvas = CreateCanvas(inParameters.width, inParameters.height, inParameters.displayCanvas);
            }

            this.Canvas = inParameters.canvas;
            this.Parameters = inParameters;
            this.Random = inParameters.random;
        }

        public Generate(canvas?: HTMLCanvasElement, separateCanvas: boolean= true) {
            // Create the Perlin Noise
            var noise = this.randomNoise(separateCanvas, this.Parameters.displayCanvas);
            canvas = canvas || this.Canvas || CreateCanvas(this.Parameters.width, this.Parameters.height, this.Parameters.displayCanvas);
            var context = canvas.getContext("2d");
            context.save();

            var ratio = this.Parameters.width / this.Parameters.height;

            /* Scale random iterations onto the canvas to generate Perlin noise. */
            for (var size = 4; size <= noise.height; size *= this.Parameters.param) {
                var x = (this.Random.Random() * (noise.width - size)) | 0,
                    y = (this.Random.Random() * (noise.height - size)) | 0;
                context.globalAlpha = 4 / size;
                context.drawImage(noise, Math.max(x, 0), y, size * ratio, size, 0, 0, this.Parameters.width, this.Parameters.height);
            }

            context.restore();

            return canvas;
        }

    }
}