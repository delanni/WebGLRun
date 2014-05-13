// CREDITS TO Jérémy Bouny : https://github.com/jbouny/terrain-generator/blob/master/terraingen.js
// Modified by Alex

interface TerrainGeneratorParameters {
    width?: number;
    height?: number;
    canvas?: HTMLCanvasElement;
    displayCanvas?: boolean;
    type?: number;
    depth?: number;
    postgen?: any[];
    effect?: any[];
    filter?: ICanvasFilter[];
    minHeight?: number;
    maxHeight?: number;
    submesh?: number;
    generator?: PerlinNoiseGenerator;
}

class TerrainGenerator {
    public Parameters: TerrainGeneratorParameters;
    public Canvas: HTMLCanvasElement;

    constructor(params: TerrainGeneratorParameters) {
        this.Canvas = params.canvas;
        this.Parameters = params;
    }

    Generate(): HTMLCanvasElement {
        this.Parameters = this.Parameters || {};

        // Manage default parameters
        this.Parameters.type = this.Parameters.type || 0;
        this.Parameters.depth = this.Parameters.depth || 10;
        this.Parameters.width = this.Parameters.width || 100;
        this.Parameters.height = this.Parameters.height || 100;
        this.Parameters.postgen = this.Parameters.postgen || [];
        this.Parameters.effect = this.Parameters.effect || [];
        this.Parameters.filter = this.Parameters.filter || [];

        if (typeof this.Parameters.canvas == 'undefined')
            this.Parameters.canvas = CreateCanvas(this.Parameters.width, this.Parameters.height, this.Parameters.displayCanvas);
        this.Parameters.width = this.Canvas.width;
        this.Parameters.height = this.Canvas.height;

        var noise = this.Parameters.generator.Generate(this.Canvas);

        // Apply filters
        for (var i = 0; i < this.Parameters.filter.length; ++i) {
            if (this.Parameters.filter[i].Check(noise)) {
                this.Parameters.filter[i].Apply(noise);
            }
        }

        return noise;
    }

    NoiseToBabylonMesh(noise: HTMLCanvasElement, scene: BABYLON.Scene): BABYLON.Mesh {
        var terrainMesh = BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas(name, noise, this.Parameters.width, this.Parameters.height, this.Parameters.submesh, this.Parameters.minHeight, this.Parameters.maxHeight, scene, false);
        return terrainMesh;
    }

}