// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex

module TERRAIN {
    export interface LandscapeGeneratorParameters {
        displayCanvas?: boolean;
        postgen?: any[];
        effect?: any[];
        filter?: FILTERS.ICanvasFilter[];
        minHeight?: number;
        maxHeight?: number;
        width?: number;
        height?: number;
        destructionLevel?: number;
        submesh?: number;
        param?: number;
        random?: RandomProvider;
        pathTopOffset?: number;
        pathBottomOffset?: number;
    }

    export class LandscapeGenerator {
        public Parameters: LandscapeGeneratorParameters;
        public Canvas: HTMLCanvasElement;

        private _maxHeight: number;
        private _minHeight: number;
        private _gradient: ImageData;
        private _gradientBase: number = 0;

        constructor(params: LandscapeGeneratorParameters) {
            this.Parameters = params;
        }

        getHeightColorFor(height: number): number[] {
            var gradientCanvas: HTMLCanvasElement;
            var width = this._maxHeight | 0 - this._minHeight | 0;

            if (this._gradient == null) {
                gradientCanvas = CreateCanvas(width, 2, true);
                var ctx = gradientCanvas.getContext("2d");
                var gradient1 = ctx.createLinearGradient(0, 0, gradientCanvas.width, 1);
                var gradient2 = ctx.createLinearGradient(0, 0, gradientCanvas.width, 1);
                gradient1.addColorStop(0, "#088A08"); // LIGHTGREEN
                gradient1.addColorStop(0.0111, "#088A08"); // YELLOW
                gradient1.addColorStop(0.0112, "#5E610B"); // YELLOW
                gradient1.addColorStop(0.7, "#190B07"); // DARKBROWN
                gradient1.addColorStop(1, "#BDBDBD"); // GREy
                gradient2.addColorStop(0, "#000000");
                gradient2.addColorStop(1, "#ffffff");
                ctx.fillStyle = gradient1;
                ctx.fillRect(0, 0, gradientCanvas.width, 1);
                ctx.fillStyle = gradient2;
                ctx.fillRect(0, 1, gradientCanvas.width, 1);
                this._gradient = ctx.getImageData(0, 0, gradientCanvas.width, gradientCanvas.height);
            }
            var index = (height * (width) * 4) | 0;
            index -= index % 4;
            index = index % ((width) * 4);
            index += this._gradientBase;
            return [this._gradient.data[index], this._gradient.data[index + 1], this._gradient.data[index + 2]];
            //return [height, height, height];
        }

        colorizeMesh(mesh: BABYLON.Mesh) {
            var positionData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var colorData = [];

            Trace("Mapping");
            var copy = positionData.map(function (x, i) { return i % 3 == 1 ? x : 0 });
            Trace("Mapping");

            Trace("Sorting");
            //var copySorted = copy.sort((a,b)=>a>b?1:-1);
            //this._maxHeight = copy.pop();
            //this._minHeight = copy.shift();
            console.log("Total number of vertices:" + copy.length / 3);
            this._maxHeight = copy.reduce((lastItem, newItem) => lastItem > newItem ? lastItem : newItem);
            this._minHeight = copy.reduce((lastItem, newItem) => lastItem < newItem ? lastItem : newItem);
            var heightScale = this._maxHeight - this._minHeight;

            Trace("Sorting");

            Trace("Color fetching");
            for (var i = 1; i < positionData.length; i += 3) {
                var h = (positionData[i] - this._minHeight) / heightScale;
                var color = this.getHeightColorFor(h);
                colorData.push(color[0] / 255, color[1] / 255, color[2] / 255);
            }
            Trace("Color fetching");

            mesh.setVerticesData(colorData, BABYLON.VertexBuffer.ColorKind, true);
        }

        GenerateOn(scene: BABYLON.Scene): BABYLON.Mesh {
            var random = this.Parameters.random;

            var terrainGen = new TerrainGenerator({
                width: this.Parameters.width,
                height: this.Parameters.height,
                displayCanvas: this.Parameters.displayCanvas,
                minHeight: this.Parameters.minHeight,
                maxHeight: this.Parameters.maxHeight,
                submesh: this.Parameters.submesh,
                steps: []
            });

            // Generate noise
            terrainGen.AddStep(tg => {
                var noiseGen = new PerlinNoiseGenerator({
                    displayCanvas: tg.Parameters.displayCanvas,
                    height: tg.Parameters.height,
                    width: tg.Parameters.width,
                    random: random,
                    param: this.Parameters.param || 1.1
                });

                var noiseCanvas = noiseGen.Generate();

                tg.DraftCanvases["noiseCanvas"] = noiseCanvas;
                return true;
            }, "Perlin noise generation");

            // Generate ravine path
            terrainGen.AddStep(tg=> {
                var pathCanvas = CreateCanvas(this.Parameters.width, this.Parameters.height, this.Parameters.displayCanvas);
                var pathGen = new PathGenerator(random);

                pathGen.MakePath(pathCanvas, this.Parameters.pathBottomOffset, this.Parameters.pathTopOffset);

                tg.DraftCanvases["pathCanvas"] = pathCanvas;

                return true;
            }, "Path generation");

            // Blur path
            terrainGen.AddStep(tg=> {
                var pathCanvas = tg.DraftCanvases["pathCanvas"];

                var bleedBlurPass1 = new FILTERS.BleedFeed(pathCanvas, 30, 6, true);
                var bleedBlurPass2 = new FILTERS.BleedFeed(pathCanvas, 8, 3, true);
                var bleedBlurPass3 = new FILTERS.BleedFeed(pathCanvas, 100, 1, true);
                //var pathBlurFilter = new FILTERS.StackBlurFilter(70);

                if (bleedBlurPass1.Check(pathCanvas)) bleedBlurPass1.Apply(pathCanvas);
                if (bleedBlurPass2.Check(pathCanvas)) bleedBlurPass2.Apply(pathCanvas);
                if (bleedBlurPass3.Check(pathCanvas)) bleedBlurPass3.Apply(pathCanvas);
                //if (pathBlurFilter.Check(pathCanvas)) pathBlurFilter.Apply(pathCanvas);

                return true;
            }, "Path blurring");

            // Make secondary noise
            terrainGen.AddStep(tg=> {
                // snCanvas = secondaryNoiseCanvas
                var snCanvas = CreateCanvas(this.Parameters.width / 2, this.Parameters.height / 2, true);
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
            terrainGen.AddStep(tg=> {
                var noiseCanvas = tg.DraftCanvases["noiseCanvas"];
                var pathCanvas = tg.DraftCanvases["pathCanvas"];
                var snCanvas = tg.DraftCanvases["snCanvas"];

                var histogramEqualizer = new FILTERS.HistogramEqFilter(0, 1);
                var softBlur = new FILTERS.StackBlurFilter(12);
                var copyNoise = new FILTERS.CopyOverwriteFilter(noiseCanvas);
                var engraveDestruction = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(snCanvas, this.Parameters.width, this.Parameters.height));
                var engravePath = new FILTERS.DarknessCopyFilter(pathCanvas);

                copyNoise.Apply(tg.Canvas);
                engraveDestruction.Apply(tg.Canvas);
                histogramEqualizer.Apply(tg.Canvas);
                softBlur.Apply(tg.Canvas);
                engravePath.Apply(tg.Canvas);

                return true;
            }, "Noise compositing");

            Trace("Terrain");
            var noise = terrainGen.Generate();
            Trace("Terrain");

            Trace("Mesh from height map");
            var mesh = terrainGen.NoiseToBabylonMesh(noise, scene);
            Trace("Mesh from height map");


            Trace("Colorize mesh");
            this.colorizeMesh(mesh);
            Trace("Colorize mesh");

            return mesh;
        }

    }
}