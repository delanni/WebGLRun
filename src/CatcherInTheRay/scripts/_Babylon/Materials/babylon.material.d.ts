declare module BABYLON {
    class Material {
        public name: string;
        public id: string;
        public checkReadyOnEveryCall: boolean;
        public checkReadyOnlyOnce: boolean;
        public alpha: number;
        public wireframe: boolean;
        public backFaceCulling: boolean;
        public onCompiled: (effect: Effect) => void;
        public onError: (effect: Effect, errors: string) => void;
        public onDispose: () => void;
        public getRenderTargetTextures: () => SmartArray;
        public _effect: Effect;
        public _wasPreviouslyReady: boolean;
        private _scene;
        constructor(name: string, scene: Scene, doNotAdd?: boolean);
        public isReady(mesh?: Mesh): boolean;
        public getEffect(): Effect;
        public getScene(): Scene;
        public needAlphaBlending(): boolean;
        public needAlphaTesting(): boolean;
        public trackCreation(onCompiled: (effect: Effect) => void, onError: (effect: Effect, errors: string) => void): void;
        public _preBind(): void;
        public bind(world: Matrix, mesh: Mesh): void;
        public unbind(): void;
        public dispose(forceDisposeEffect?: boolean): void;
    }
}
