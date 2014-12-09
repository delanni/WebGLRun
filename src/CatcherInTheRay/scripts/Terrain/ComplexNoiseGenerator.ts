// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex
module TERRAIN {

    export class ComplexNoiseGenerator {
        public DraftCanvases: { [canvasName: string]: HTMLCanvasElement };
        public Steps: ComplexNoiseGenStep[];
        private _stepCounter: number;
        public OutCanvas;

        constructor() {
            this.Steps = [];
            this.DraftCanvases = {};
            this._stepCounter = 0;
        }

        GenerateOn(canvas:HTMLCanvasElement): HTMLCanvasElement {
            this.OutCanvas = canvas;

            while (this.Steps.length > 0) {
                var actualStep = this.Steps.shift();
                var result = actualStep.Execute(this);
                if (!result) {
                    this.Steps.unshift(actualStep);
                }
            }

            return canvas;
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