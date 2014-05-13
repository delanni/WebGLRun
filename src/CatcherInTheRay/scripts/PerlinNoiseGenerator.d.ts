/// <reference path="references.d.ts" />
interface NoiseParameters {
    random: RandomProvider;
    width?: number;
    height?: number;
    canvas?: HTMLCanvasElement;
    param?: number;
    displayCanvas?: boolean;
}
declare class PerlinNoiseGenerator {
    public Canvas: HTMLCanvasElement;
    public Parameters: NoiseParameters;
    public Random: RandomProvider;
    private randomNoise(separateCanvas, displayCanvas);
    constructor(inParameters: NoiseParameters);
    public Generate(canvas: HTMLCanvasElement, separateCanvas?: boolean): HTMLCanvasElement;
}
