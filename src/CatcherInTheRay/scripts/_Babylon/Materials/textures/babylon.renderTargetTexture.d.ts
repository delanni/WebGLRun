declare module BABYLON {
    class RenderTargetTexture extends Texture {
        public renderList: Mesh[];
        public renderParticles: boolean;
        public renderSprites: boolean;
        public coordinatesMode: number;
        public onBeforeRender: () => void;
        public onAfterRender: () => void;
        public customRenderFunction: (opaqueSubMeshes: SmartArray, transparentSubMeshes: SmartArray, alphaTestSubMeshes: SmartArray, beforeTransparents?: () => void) => void;
        private _size;
        public _generateMipMaps: boolean;
        private _renderingManager;
        public _waitingRenderList: string[];
        private _doNotChangeAspectratio;
        constructor(name: string, size: any, scene: Scene, generateMipMaps?: boolean, doNotChangeAspectratio?: boolean);
        public getRenderSize(): number;
        public resize(size: any, generateMipMaps: any): void;
        public render(): void;
        public clone(): RenderTargetTexture;
    }
}
