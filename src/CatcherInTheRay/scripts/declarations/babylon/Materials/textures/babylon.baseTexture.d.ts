declare module BABYLON {
    class BaseTexture {
        public delayLoadState: number;
        public hasAlpha: boolean;
        public level: number;
        public isCube: boolean;
        public _texture: WebGLTexture;
        public onDispose: () => void;
        private _scene;
        constructor(scene: Scene);
        public getScene(): Scene;
        public getInternalTexture(): WebGLTexture;
        public isReady(): boolean;
        public getSize(): ISize;
        public getBaseSize(): ISize;
        public _getFromCache(url: string, noMipmap: boolean): WebGLTexture;
        public delayLoad(): void;
        public releaseInternalTexture(): void;
        public dispose(): void;
    }
}
