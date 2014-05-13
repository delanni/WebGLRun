declare module BABYLON {
    class PointLight extends Light {
        public position: Vector3;
        private _worldMatrix;
        private _transformedPosition;
        constructor(name: string, position: Vector3, scene: Scene);
        public transferToEffect(effect: Effect, positionUniformName: string): void;
        public getShadowGenerator(): ShadowGenerator;
        public _getWorldMatrix(): Matrix;
    }
}
