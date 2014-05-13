interface ICanvasFilter{
    Check: (canvas: HTMLCanvasElement) => boolean;
    Apply: (canvas: HTMLCanvasElement) => HTMLCanvasElement;
}