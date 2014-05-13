declare module BABYLON {
    class CubeTexture extends BaseTexture {
        public name: string;
        public url: string;
        public coordinatesMode: number;
        private _noMipmap;
        private _extensions;
        private _textureMatrix;
        constructor(rootUrl: string, scene: Scene, extensions: string[], noMipmap?: boolean);
        public delayLoad(): void;
        public _computeReflectionTextureMatrix(): Matrix;
    }
}
