declare module BABYLON {
    class RenderingManager {
        static MAX_RENDERINGGROUPS: number;
        private _scene;
        private _renderingGroups;
        private _depthBufferAlreadyCleaned;
        constructor(scene: Scene);
        private _renderParticles(index, activeMeshes);
        private _renderSprites(index);
        private _clearDepthBuffer();
        public render(customRenderFunction: (opaqueSubMeshes: SmartArray, transparentSubMeshes: SmartArray, alphaTestSubMeshes: SmartArray, beforeTransparents: () => void) => void, activeMeshes: Mesh[], renderParticles: boolean, renderSprites: boolean): void;
        public reset(): void;
        public dispatch(subMesh: SubMesh): void;
    }
}
