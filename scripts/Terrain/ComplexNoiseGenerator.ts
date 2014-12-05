// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex
module TERRAIN {
    export interface ComplexNoiseGeneratorParameters {
        width?: number;
        height?: number;
        displayCanvas?: boolean;
        type?: number;
        depth?: number;
        steps?: ComplexNoiseGenStep[];
        minHeight?: number;
        maxHeight?: number;
        subdivisions?: number;
    }

    export class ComplexNoiseGenerator {
        public Parameters: ComplexNoiseGeneratorParameters;
        public Canvas: HTMLCanvasElement;
        public DraftCanvases: { [canvasName: string]: HTMLCanvasElement };
        public Steps: ComplexNoiseGenStep[];
        private _stepCounter: number;

        constructor(params: ComplexNoiseGeneratorParameters) {
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

        AddStep(step: (terrainGen: ComplexNoiseGenerator) => boolean, tag?: string) {
            tag = tag || "Step " + this._stepCounter;
            this._stepCounter += 1;
            this.Steps.push(new ComplexNoiseGenStep(step, tag));
        }

    }


    export class ComplexNoiseGenStep {
        _func: (terrainGen: ComplexNoiseGenerator) => boolean;
        _tag: string;

        constructor(func: (terrainGen: ComplexNoiseGenerator) => boolean, tag: string) {
            this._func = func;
            this._tag = tag;
        }

        Execute(executeOn: ComplexNoiseGenerator): boolean {
            console.time(JSON.stringify(this._tag));
            console.log("Starting step:", this._tag);
            var result = this._func(executeOn);
            console.timeEnd(JSON.stringify(this._tag));
            console.log("Finished: ", this._tag, ".");
            return result;
        }
    }
}