declare var BABYLON: any;
declare module GAME {
    class Game {
        public gameWorld: any;
        public engine: any;
        public scene: any;
        public camera: any;
        public canvas: any;
        public items: {
            [name: string]: any;
        };
        constructor();
        public init(): void;
        private animate();
    }
}
