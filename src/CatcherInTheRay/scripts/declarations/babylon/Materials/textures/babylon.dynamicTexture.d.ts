declare module BABYLON {
    class DynamicTexture extends Texture {
        private _generateMipMaps;
        private _canvas;
        private _context;
        constructor(name: any, options: any, scene: any, generateMipMaps: any);
        public getContext(): CanvasRenderingContext2D;
        public update(invertY?: boolean): void;
        public drawText(text: string, x: number, y: number, font: string, color: string, clearColor: string, invertY?: boolean): void;
        public clone(): DynamicTexture;
    }
}
