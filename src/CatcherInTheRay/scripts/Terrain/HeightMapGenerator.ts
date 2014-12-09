// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex

module TERRAIN {
    export interface HeightMapGeneratorParams extends NoiseParameters {
        destructionLevel?: number;
        pathTopOffset?: number;
        pathBottomOffset?: number;
        shrink?: number;
        eqFactor?: number;
        heightmap?: string;
    }

    export class HeightMapGenerator {
        public Parameters: HeightMapGeneratorParams;
        public Canvas: HTMLCanvasElement;

        constructor(params: HeightMapGeneratorParams) {
            this.Parameters = params;
            this.Canvas = CreateCanvas(params.width, params.height, true, "mainNoiseCanvas", c=> {
                c.style.display = "none";
            });
        }

        GenerateHeightMap(): HTMLCanvasElement{
            if (this.Parameters.heightmap) {
                var image = new Image(this.Canvas.width, this.Canvas.height);
                image.src = this.Parameters.heightmap;
                var ctx = this.Canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                return this.Canvas;
            }

            var random = this.Parameters.random;
            var noiseGenerator = new ComplexNoiseGenerator();

            // Generate noise
            noiseGenerator.AddStep(tg => {
                var noiseGen = new PerlinNoiseGenerator({
                    displayCanvas: this.Parameters.displayCanvas,
                    height: this.Parameters.height,
                    width: this.Parameters.width,
                    random: random,
                    param: this.Parameters.param || 1.1
                });

                var noiseCanvas = noiseGen.Generate();

                tg.DraftCanvases["noiseCanvas"] = noiseCanvas;
                return true;
            }, "Perlin noise generation");

            // Generate ravine path
            noiseGenerator.AddStep(tg=> {
                var SHRINK = this.Parameters.shrink;
                var pathCanvas = CreateCanvas(this.Parameters.width / SHRINK, this.Parameters.height / SHRINK, this.Parameters.displayCanvas, "ravinePathCanvas");
                var pathGen = new PathGenerator(random);

                pathGen.MakePath(pathCanvas, this.Parameters.pathBottomOffset / SHRINK, this.Parameters.pathTopOffset / SHRINK);

                tg.DraftCanvases["pathCanvas"] = pathCanvas;

                return true;
            }, "Path generation");

            // Blur path
            noiseGenerator.AddStep(tg=> {
                var pathCanvas = tg.DraftCanvases["pathCanvas"];

                var bleedBlurPass1 = new FILTERS.BleedFeed(pathCanvas, 30, 6, true);
                if (bleedBlurPass1.Check(pathCanvas)) bleedBlurPass1.Apply(pathCanvas);
                var bleedBlurPass2 = new FILTERS.BleedFeed(pathCanvas, 4, 3, true);
                if (bleedBlurPass2.Check(pathCanvas)) bleedBlurPass2.Apply(pathCanvas);
                var bleedBlurPass3 = new FILTERS.BleedFeed(pathCanvas, 30, 1, true);
                if (bleedBlurPass3.Check(pathCanvas)) bleedBlurPass3.Apply(pathCanvas);

                return true;
            }, "Path blurring");

            // Make secondary noise
            noiseGenerator.AddStep(tg=> {
                var snCanvas = CreateCanvas(this.Parameters.width / 2, this.Parameters.height / 2,
                    this.Parameters.displayCanvas, "secondaryNoiseCanvas");
                var ctx = snCanvas.getContext("2d");

                var pathGen = new PathGenerator(random);

                ctx.save();
                for (var i = 0; i < this.Parameters.destructionLevel; i++) {
                    pathGen.MakePath(
                        snCanvas,
                        (random.Random() * snCanvas.width) | 0,
                        (random.Random() * snCanvas.width) | 0,
                        i == 0
                        );
                    var randomOffset = random.Random() * snCanvas.width;
                    ctx.translate(snCanvas.width / 2 + randomOffset, snCanvas.height / 2);
                    ctx.rotate(random.Random() * 360);
                    ctx.translate(-snCanvas.width / 2 - randomOffset, -snCanvas.height / 2);
                }
                ctx.restore();

                var bleedBlurPass1 = new FILTERS.BleedFeed(snCanvas, 30, 6, true);
                var smallBlurFilter = new FILTERS.StackBlurFilter(12);

                if (bleedBlurPass1.Check(snCanvas)) bleedBlurPass1.Apply(snCanvas);
                if (smallBlurFilter.Check(snCanvas)) smallBlurFilter.Apply(snCanvas);

                tg.DraftCanvases["snCanvas"] = snCanvas;

                return true;
            }, "Secondary noise generation");

            // Composite them
            noiseGenerator.AddStep(tg=> {
                var noiseCanvas = tg.DraftCanvases["noiseCanvas"];
                var pathCanvas = tg.DraftCanvases["pathCanvas"];
                var snCanvas = tg.DraftCanvases["snCanvas"];

                var histogramEqualizer = new FILTERS.HistogramEqFilter(0, 1);
                var softBlur = new FILTERS.StackBlurFilter(12);
                var copyNoise = new FILTERS.CopyOverwriteFilter(noiseCanvas);
                var engraveDestruction = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(snCanvas, this.Parameters.width, this.Parameters.height));
                var engravePath = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(pathCanvas, this.Parameters.width, this.Parameters.height));

                copyNoise.Apply(tg.OutCanvas);
                engraveDestruction.Apply(tg.OutCanvas);
                histogramEqualizer.Apply(tg.OutCanvas);
                softBlur.Apply(tg.OutCanvas);
                engravePath.Apply(tg.OutCanvas);

                return true;
            }, "Noise compositing");

            // Fire the chain
            Trace("Terrain");
            var noise = noiseGenerator.GenerateOn(this.Canvas);
            Trace("Terrain");

            return noise;
        }

    }
}