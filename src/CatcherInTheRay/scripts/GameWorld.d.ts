/// <reference path="references.d.ts" />
declare module GAME {
    class GameWorld {
        public _engine: BABYLON.Engine;
        public _scene: BABYLON.Scene;
        public _camera: BABYLON.Camera;
        public _canvas: HTMLCanvasElement;
        public _lights: BABYLON.Light[];
        constructor(canvasId: string, fullify?: string);
        public extendCanvas(fullify: string): void;
        public gameLoop(): void;
        public renderLoop(): void;
        public triggerTicksOnAllEntities(): void;
        public collisionLoop(): void;
        public loadScene(s: Scenes): void;
    }
    enum Scenes {
        TEST = 0,
        MAIN = 1,
        GAME = 2,
    }
}
