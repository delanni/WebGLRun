declare module BABYLON {
    class StandardMaterial extends Material {
        public diffuseTexture: Texture;
        public ambientTexture: Texture;
        public opacityTexture: Texture;
        public reflectionTexture: Texture;
        public emissiveTexture: Texture;
        public specularTexture: Texture;
        public bumpTexture: Texture;
        public ambientColor: Color3;
        public diffuseColor: Color3;
        public specularColor: Color3;
        public specularPower: number;
        public emissiveColor: Color3;
        private _cachedDefines;
        private _renderTargets;
        private _worldViewProjectionMatrix;
        private _lightMatrix;
        private _globalAmbientColor;
        private _baseColor;
        private _scaledDiffuse;
        private _scaledSpecular;
        private _renderId;
        constructor(name: string, scene: Scene);
        public needAlphaBlending(): boolean;
        public needAlphaTesting(): boolean;
        public isReady(mesh?: Mesh): boolean;
        public unbind(): void;
        public bind(world: Matrix, mesh: Mesh): void;
        public getAnimatables(): IAnimatable[];
        public dispose(forceDisposeEffect?: boolean): void;
        public clone(name: string): StandardMaterial;
        static DiffuseTextureEnabled: boolean;
        static AmbientTextureEnabled: boolean;
        static OpacityTextureEnabled: boolean;
        static ReflectionTextureEnabled: boolean;
        static EmissiveTextureEnabled: boolean;
        static SpecularTextureEnabled: boolean;
        static BumpTextureEnabled: boolean;
    }
}
