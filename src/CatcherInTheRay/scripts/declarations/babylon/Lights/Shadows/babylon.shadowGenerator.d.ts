declare module BABYLON {
    class ShadowGenerator {
        public useVarianceShadowMap: boolean;
        private _light;
        private _scene;
        private _shadowMap;
        private _darkness;
        private _transparencyShadow;
        private _effect;
        private _viewMatrix;
        private _projectionMatrix;
        private _transformMatrix;
        private _worldViewProjection;
        private _cachedPosition;
        private _cachedDirection;
        private _cachedDefines;
        constructor(mapSize: number, light: DirectionalLight);
        public isReady(mesh: Mesh): boolean;
        public getShadowMap(): RenderTargetTexture;
        public getLight(): DirectionalLight;
        public getTransformMatrix(): Matrix;
        public getDarkness(): number;
        public setDarkness(darkness: number): void;
        public setTransparencyShadow(hasShadow: boolean): void;
        public dispose(): void;
    }
}
