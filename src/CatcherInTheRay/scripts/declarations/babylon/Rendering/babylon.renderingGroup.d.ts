declare module BABYLON {
    class RenderingGroup {
        public index: number;
        private _scene;
        private _opaqueSubMeshes;
        private _transparentSubMeshes;
        private _alphaTestSubMeshes;
        private _activeVertices;
        constructor(index: number, scene: Scene);
        public render(customRenderFunction: (opaqueSubMeshes: SmartArray, transparentSubMeshes: SmartArray, alphaTestSubMeshes: SmartArray, beforeTransparents: () => void) => void, beforeTransparents: any): boolean;
        public prepare(): void;
        public dispatch(subMesh: SubMesh): void;
    }
}
