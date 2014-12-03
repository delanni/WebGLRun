declare module BABYLON {
    class Light extends Node {
        public diffuse: Color3;
        public specular: Color3;
        public intensity: number;
        public range: number;
        public excludedMeshes: Mesh[];
        public _shadowGenerator: ShadowGenerator;
        private _parentedWorldMatrix;
        constructor(name: string, scene: Scene);
        public getShadowGenerator(): ShadowGenerator;
        public transferToEffect(effect: Effect, uniformName0?: string, uniformName1?: string): void;
        public _getWorldMatrix(): Matrix;
        public getWorldMatrix(): Matrix;
        public dispose(): void;
    }
}
