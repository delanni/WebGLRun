interface BlurInterface {
    stackBlurImage: (imageId: string, canvasID: string, radius: number, blurAlphaChannel: boolean) => void;
    stackBlurCanvasRGB: (id:string, top_x:number, top_y:number, width:number, height:number, radius:number) => void;
    stackBlurCanvasRGBA: (id:string, top_x:number, top_y:number, width:number, height:number, radius:number) => void;
    stackBlurCanvasRGBFromCanvas: (canvas: HTMLCanvasElement, top_x:number, top_y:number, width:number, height:number, raidus: number)=>void;
    stackBlurCanvasRGBAFromCanvas: (canvas: HTMLCanvasElement, top_x: number, top_y: number, width: number, height: number, raidus: number) => void;
}

declare var BLUR: BlurInterface;