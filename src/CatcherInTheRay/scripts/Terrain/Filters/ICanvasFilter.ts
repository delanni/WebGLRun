module FILTERS {
    export interface ICanvasFilter {
        Check: (canvas: HTMLCanvasElement) => boolean;
        Apply: (canvas: HTMLCanvasElement) => HTMLCanvasElement;
    }
}