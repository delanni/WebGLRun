declare class PathGenerator {
    public r: RandomProvider;
    constructor(seed: number);
    public MakePath(canvas: HTMLCanvasElement, from: any, to: any): void;
    public GeneratePath(canvas: HTMLCanvasElement, from: any, to: any): any;
    private interpolate(P0, P1, P2, P3, u);
    public drawCatmull(canvas: HTMLCanvasElement, points: any, xoffset: number): void;
    public makeCatmull(anchors: Point[]): Point[];
    public drawPath(canvas: HTMLCanvasElement, points: Point[]): void;
}
interface Point {
}
