﻿// CREDITS to Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/generators/perlinnoise.js
// Modified by Alex Szabo
/// <reference path="references.ts" />

var PerlinNoiseGenerator = (function () {
    function PerlinNoiseGenerator(inParameters) {
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
    PerlinNoiseGenerator.prototype.randomNoise = function (separateCanvas, displayCanvas) {
        var noiseCanvas = separateCanvas ? CreateCanvas(this.Parameters.width, this.Parameters.height, displayCanvas) : this.Canvas;

        var g = noiseCanvas.getContext("2d"), imageData = g.getImageData(0, 0, noiseCanvas.width, noiseCanvas.height), pixels = imageData.data;

        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i] = pixels[i + 1] = pixels[i + 2] = (this.Random.Random() * 256) | 0;

            pixels[i + 3] = 255;
        }

        g.putImageData(imageData, 0, 0);
        return noiseCanvas;
    };

    PerlinNoiseGenerator.prototype.Generate = function (canvas, separateCanvas) {
        if (typeof separateCanvas === "undefined") { separateCanvas = true; }
        // Create the Perlin Noise
        var noise = this.randomNoise(separateCanvas, this.Parameters.displayCanvas);
        var context = this.Canvas.getContext("2d");
        context.save();

        var ratio = this.Parameters.width / this.Parameters.height;

        for (var size = 4; size <= noise.height; size *= this.Parameters.param) {
            var x = (this.Random.Random() * (noise.width - size)) | 0, y = (this.Random.Random() * (noise.height - size)) | 0;
            context.globalAlpha = 4 / size;
            context.drawImage(noise, Math.max(x, 0), y, size * ratio, size, 0, 0, this.Parameters.width, this.Parameters.height);
        }

        context.restore();

        return canvas;
    };
    return PerlinNoiseGenerator;
})();
