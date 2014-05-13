/// <reference path="references.d.ts" />
declare module GAME {
    class Game {
        public gameWorld: any;
        public engine: BABYLON.Engine;
        public scene: BABYLON.Scene;
        public camera: BABYLON.Camera;
        public canvas: HTMLCanvasElement;
        public items: {
            [name: string]: any;
        };
        constructor();
        public init(): void;
        private animate();
    }
}
