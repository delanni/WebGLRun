declare module BABYLON {
    class PostProcessRenderPass {
        public name: string;
        private _enabled;
        private _renderList;
        private _renderTexture;
        private _scene;
        private _refCount;
        constructor(scene: Scene, name: string, size: number, renderList: Mesh[], beforeRender: () => void, afterRender: () => void);
        public incRefCount(): number;
        public decRefCount(): number;
        public setRenderList(renderList: Mesh[]): void;
        public getRenderTexture(): RenderTargetTexture;
        public _update(): void;
    }
}
