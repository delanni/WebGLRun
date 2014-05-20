declare module FILTERS {
    interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    class StackBlurFilter implements ICanvasFilter {
        public _fullCanvas: boolean;
        public _customRect: Rectangle;
        public _radius: number;
        public _useAlpha: boolean;
        constructor(radius: number, customRect?: Rectangle);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    function Upscale(canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement;
}
declare module FILTERS {
    /**
    * This filter overwrites the target canvas' area with the parameter's data.
    **/
    class CopyOverwriteFilter implements ICanvasFilter {
        public _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    /**
    * This filter copies the param data byte to byte and adds it to the target.
    **/
    class AdditiveCopyFilter implements ICanvasFilter {
        public _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class InverseAdditiveCopyFilter implements ICanvasFilter {
        public _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    /**
    * This filter copies the param data byte to byte and substracts it from the target (except for the alpha value);
    **/
    class SubstractiveCopyFilter implements ICanvasFilter {
        public _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class DarknessCopyFilter implements ICanvasFilter {
        public _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    /**
    * This filter takes the canvas, and blurs it, while feeding itself back, so that the original image is copied back
    **/
    class BleedFeed implements ICanvasFilter {
        public _paramCanvas: HTMLCanvasElement;
        public _isDarkFeed: boolean;
        public _blurriness: number;
        public _iterations: number;
        constructor(paramCanvas: HTMLCanvasElement, blurRadius: number, iterations: number, darkfeed?: boolean);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
}
declare module GAME {
    module SCENES {
        class SceneBuilder {
            public _gameWorld: GameWorld;
            constructor(gameWorld: GameWorld);
            public BuildScene(): BABYLON.Scene;
            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
            public SetParameters(params: any): void;
        }
    }
}
declare module GAME {
    module SCENES {
        interface GameParameters {
            randomSeed: number;
            debug?: boolean;
        }
        class GameScene extends SceneBuilder {
            public randomSeed: number;
            public debug: boolean;
            public _mapParams: LandscapeGeneratorParameters;
            constructor(gameWorld: GameWorld, parameters: GameParameters, mapParameters: LandscapeGeneratorParameters);
            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare function CreateCanvas(inWidth: number, inHeight: number, debug?: boolean): HTMLCanvasElement;
declare function Cast<T>(item: any): T;
declare function GetDataOfCanvas(index: number): any;
declare function Trace(message: string): void;
interface RandomProvider {
    Random: () => number;
}
declare class MersenneTwister implements RandomProvider {
    private N;
    private M;
    private MATRIX_A;
    private UPPER_MASK;
    private LOWER_MASK;
    private mt;
    private mti;
    public Random(): number;
    constructor(seed: number);
    private init_genrand(s);
    private init_by_array(init_key, key_length);
    private genrand_int32();
    private genrand_int31();
    private genrand_real1();
    private random();
    private genrand_real3();
    private genrand_res53();
}
interface NoiseParameters {
    random: RandomProvider;
    width?: number;
    height?: number;
    canvas?: HTMLCanvasElement;
    param?: number;
    displayCanvas?: boolean;
}
declare class PerlinNoiseGenerator {
    public Canvas: HTMLCanvasElement;
    public Parameters: NoiseParameters;
    public Random: RandomProvider;
    private randomNoise(separateCanvas, displayCanvas);
    constructor(inParameters: NoiseParameters);
    public Generate(canvas?: HTMLCanvasElement, separateCanvas?: boolean): HTMLCanvasElement;
}
interface TerrainGeneratorParameters {
    width?: number;
    height?: number;
    displayCanvas?: boolean;
    type?: number;
    depth?: number;
    steps?: TerrainGeneratorStep[];
    minHeight?: number;
    maxHeight?: number;
    submesh?: number;
}
declare class TerrainGenerator {
    public Parameters: TerrainGeneratorParameters;
    public Canvas: HTMLCanvasElement;
    public DraftCanvases: {
        [canvasName: string]: HTMLCanvasElement;
    };
    public Steps: TerrainGeneratorStep[];
    private _stepCounter;
    constructor(params: TerrainGeneratorParameters);
    public Generate(): HTMLCanvasElement;
    public AddStep(step: (terrainGen: TerrainGenerator) => boolean, tag?: string): void;
    public NoiseToBabylonMesh(noise: HTMLCanvasElement, scene: BABYLON.Scene): BABYLON.Mesh;
}
declare class TerrainGeneratorStep {
    public _func: (terrainGen: TerrainGenerator) => boolean;
    public _tag: string;
    constructor(func: (terrainGen: TerrainGenerator) => boolean, tag: string);
    public Execute(executeOn: TerrainGenerator): boolean;
}
interface LandscapeGeneratorParameters {
    displayCanvas?: boolean;
    postgen?: any[];
    effect?: any[];
    filter?: ICanvasFilter[];
    minHeight?: number;
    maxHeight?: number;
    width?: number;
    height?: number;
    destructionLevel?: number;
    submesh?: number;
    param?: number;
    random?: RandomProvider;
}
declare class LandscapeGenerator {
    public Parameters: LandscapeGeneratorParameters;
    public Canvas: HTMLCanvasElement;
    private _maxHeight;
    private _minHeight;
    private _gradient;
    private _gradientBase;
    constructor(params: LandscapeGeneratorParameters);
    public getHeightColorFor(height: number): number[];
    public colorizeMesh(mesh: BABYLON.Mesh): void;
    public GenerateOn(scene: BABYLON.Scene): BABYLON.Mesh;
}
declare class PathGenerator {
    public r: RandomProvider;
    constructor(random: RandomProvider);
    /**
    * This is the function to generate and draw a path on the canvas
    **/
    public MakePath(canvas: HTMLCanvasElement, from: any, to: any, opaque?: boolean): HTMLCanvasElement;
    /**
    * This is a generator who generates a path.
    **/
    public GeneratePath(canvas: HTMLCanvasElement, from: any, to: any): any[];
    private interpolate(P0, P1, P2, P3, u);
    private drawCatmull(canvas, points, xoffset);
    private makeCatmull(anchors);
    private drawPath(canvas, points, clearBeforeDraw);
}
declare module dat {
    class GUI {
    }
}
interface GameProperties {
    _sceneId: GAME.Scenes;
    _gameParameters: GAME.SCENES.GameParameters;
    _mapParameters: LandscapeGeneratorParameters;
}
declare class GUI {
    private _gameWorld;
    private _gui;
    public properties: GameProperties;
    constructor(gameWorld: GAME.GameWorld);
    public Reload(): void;
    public AttachTo(gameWorld: GAME.GameWorld): void;
    private setDefaults(defaults);
    private initialize();
}
declare module GAME {
    module SCENES {
        class TestScene extends SceneBuilder {
            constructor(gameWorld: GameWorld);
            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module GAME {
    class GameWorld {
        public _engine: BABYLON.Engine;
        public _scene: BABYLON.Scene;
        public _camera: BABYLON.Camera;
        public _canvas: HTMLCanvasElement;
        public _gui: GUI;
        public _lights: BABYLON.Light[];
        public _scenes: {
            [name: string]: SCENES.SceneBuilder;
        };
        public _defaults: GameProperties;
        constructor(canvasId: string, fullify?: string);
        public applyGuiParams(guiParams: GameProperties): void;
        public buildScenes(parameters: GameProperties): void;
        public extendCanvas(fullify: FullifyStates): void;
        public gameLoop(): void;
        public renderLoop(): void;
        public triggerTicksOnAllEntities(): void;
        public collisionLoop(): void;
        public loadScene(s: Scenes): void;
    }
    enum FullifyStates {
        NO = 0,
        SOFT = 1,
        HARD = 2,
    }
    enum Scenes {
        TEST = 0,
        MAIN = 1,
        GAME = 2,
    }
}
declare module FILTERS {
    class HistogramEqFilter implements ICanvasFilter {
        public _customRect: Rectangle;
        public _from: number;
        public _to: number;
        constructor(from: number, to: number);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
}
interface ICanvasFilter {
    Check: (canvas: HTMLCanvasElement) => boolean;
    Apply: (canvas: HTMLCanvasElement) => HTMLCanvasElement;
}
declare var game: GAME.GameWorld;
