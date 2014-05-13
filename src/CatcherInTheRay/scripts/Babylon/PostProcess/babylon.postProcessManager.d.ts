declare module BABYLON {
    class PostProcessManager {
        private _scene;
        private _indexBuffer;
        private _vertexDeclaration;
        private _vertexStrideSize;
        private _vertexBuffer;
        constructor(scene: Scene);
        public _prepareFrame(): void;
        public _finalizeFrame(doNotPresent?: boolean): void;
        public dispose(): void;
    }
}
