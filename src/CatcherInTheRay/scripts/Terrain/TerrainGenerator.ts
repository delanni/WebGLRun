// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex
module TERRAIN {
    export interface TerrainGeneratorParameters {
        width?: number;
        height?: number;
        displayCanvas?: boolean;
        type?: number;
        depth?: number;
        steps?: TerrainGeneratorStep[];
        minHeight?: number;
        maxHeight?: number;
        submesh?: number;
    }

    export class TerrainGenerator {
        public Parameters: TerrainGeneratorParameters;
        public Canvas: HTMLCanvasElement;
        public DraftCanvases: { [canvasName: string]: HTMLCanvasElement };
        public Steps: TerrainGeneratorStep[];
        private _stepCounter: number;

        constructor(params: TerrainGeneratorParameters) {
            // Manage default parameters
            this.Parameters = params || {};
            this.Parameters.depth = this.Parameters.depth || 10;
            this.Parameters.width = this.Parameters.width || 100;
            this.Parameters.height = this.Parameters.height || 100;
            this.Parameters.steps = this.Parameters.steps || [];

            this.Steps = this.Parameters.steps;
            this.DraftCanvases = {};
            this._stepCounter = 0;
        }

        Generate(): HTMLCanvasElement {

            if (typeof this.Canvas == 'undefined')
                this.Canvas = CreateCanvas(this.Parameters.width, this.Parameters.height, this.Parameters.displayCanvas);
            this.Parameters.width = this.Canvas.width;
            this.Parameters.height = this.Canvas.height;

            while (this.Steps.length > 0) {
                var actualStep = this.Steps.shift();
                var result = actualStep.Execute(this);
                if (!result) {
                    this.Steps.unshift(actualStep);
                }
            }

            return this.Canvas;
        }

        AddStep(step: (terrainGen: TerrainGenerator) => boolean, tag?: string) {
            tag = tag || "Step " + this._stepCounter;
            this._stepCounter += 1;
            this.Steps.push(new TerrainGeneratorStep(step, tag));
        }

        NoiseToBabylonMesh(noise: HTMLCanvasElement, scene: BABYLON.Scene): BABYLON.Mesh {
            var terrainMesh = BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas(name, noise, this.Parameters.width, this.Parameters.height, this.Parameters.submesh, this.Parameters.minHeight, this.Parameters.maxHeight, scene, false);
            return terrainMesh;
        }

    }


    export class TerrainGeneratorStep {
        _func: (terrainGen: TerrainGenerator) => boolean;
        _tag: string;

        constructor(func: (terrainGen: TerrainGenerator) => boolean, tag: string) {
            this._func = func;
            this._tag = tag;
        }

        Execute(executeOn: TerrainGenerator): boolean {
            console.time(JSON.stringify(this._tag));
            console.log("Starting step:", this._tag);
            var result = this._func(executeOn);
            console.timeEnd(JSON.stringify(this._tag));
            console.log("Finished: ", this._tag, ".");
            return result;
        }
    }
}