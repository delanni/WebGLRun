interface TerrainGeneratorParameters {
    width?: number;
    height?: number;
    canvas?: HTMLCanvasElement;
    displayCanvas?: boolean;
    type?: number;
    depth?: number;
    postgen?: any[];
    effect?: any[];
    filter?: any[];
    generator?: PerlinNoiseGenerator;
}
declare class TerrainGenerator {
    public Parameters: TerrainGeneratorParameters;
    public Canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement);
    public Generate(): void;
}
