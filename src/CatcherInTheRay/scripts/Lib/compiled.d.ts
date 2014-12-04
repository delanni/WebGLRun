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
declare module FILTERS {
    class HistogramEqFilter implements ICanvasFilter {
        public _customRect: Rectangle;
        public _from: number;
        public _to: number;
        public _eqFactor: number;
        constructor(from: number, to: number, eqFactor?: number);
        public Check(canvas: HTMLCanvasElement): boolean;
        public Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
}
declare module FILTERS {
    interface ICanvasFilter {
        Check: (canvas: HTMLCanvasElement) => boolean;
        Apply: (canvas: HTMLCanvasElement) => HTMLCanvasElement;
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
        class TestScene extends SceneBuilder {
            constructor(gameWorld: GameWorld);
            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module GAME {
    module SCENES {
        interface GameParameters {
            randomSeed: number;
            debug?: boolean;
            useFlatShading?: boolean;
        }
        class GameScene extends SceneBuilder {
            public _randomSeed: number;
            public _debug: boolean;
            public _useFlatShading: boolean;
            public _mapParams: TERRAIN.HeightMapGeneratorParams;
            constructor(gameWorld: GameWorld, parameters: GameParameters, mapParameters: TERRAIN.HeightMapGeneratorParams);
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
        ANIMAL = 3,
    }
}
declare module GAME {
    module SCENES {
        class AnimalScene extends SceneBuilder {
            constructor(gameWorld: GameWorld);
            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module dat {
    class GUI {
    }
}
interface GameProperties {
    _sceneId: GAME.Scenes;
    _gameParameters: GAME.SCENES.GameParameters;
    _mapParameters: TERRAIN.HeightMapGeneratorParams;
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
declare function CreateCanvas(inWidth: number, inHeight: number, debug?: boolean, id?: string): HTMLCanvasElement;
declare function Cast<T>(item: any): T;
declare function GetDataOfCanvas(index: number): any;
declare function Trace(message: string): void;
declare module UTILS {
    class Utils {
        static Clamp(scalar: number, min: number, max: number): number;
    }
}
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
declare module TERRAIN {
    interface HeightMapGeneratorParams {
        displayCanvas?: boolean;
        postgen?: any[];
        effect?: any[];
        filter?: FILTERS.ICanvasFilter[];
        minHeight?: number;
        maxHeight?: number;
        width?: number;
        height?: number;
        destructionLevel?: number;
        subdivisions?: number;
        param?: number;
        random?: RandomProvider;
        pathTopOffset?: number;
        pathBottomOffset?: number;
        shrink?: number;
        eqFactor?: number;
    }
    class HeightMapGenerator {
        public Parameters: HeightMapGeneratorParams;
        public Canvas: HTMLCanvasElement;
        constructor(params: HeightMapGeneratorParams);
        public GenerateHeightMap(): HTMLCanvasElement;
    }
}
declare module TERRAIN {
    interface TerrainGeneratorParams {
        width: number;
        height: number;
        subdivisions: number;
        minHeight: number;
        maxHeight: number;
        displayCanvas: boolean;
        colors?: any[];
    }
    class TerrainGenerator {
        private _maxHeight;
        private _minHeight;
        private _gradientBase;
        private _gradient;
        public Parameters: TerrainGeneratorParams;
        constructor(params: TerrainGeneratorParams);
        private getHeightColorFor(height);
        public ColorizeMesh(mesh: BABYLON.Mesh): void;
        public GenerateWrappingMesh(mesh: BABYLON.Mesh, scene: BABYLON.Scene): BABYLON.Mesh;
        public ConvertNoiseToBabylonMesh(noise: HTMLCanvasElement, scene: BABYLON.Scene): BABYLON.Mesh;
    }
}
declare module TERRAIN {
    class PathGenerator {
        public r: RandomProvider;
        constructor(random: RandomProvider);
        /**
        * This is the function to generate and draw a path on the canvas
        **/
        public MakePath(canvas: HTMLCanvasElement, from: any, to: any, opaque?: boolean): HTMLCanvasElement;
        public GeneratePath(canvas: HTMLCanvasElement, from: any, to: any): any[];
        /**
        * This is a generator who generates a path.
        **/
        public _GeneratePath(canvas: HTMLCanvasElement, from: any, to: any): any[];
        private interpolate(P0, P1, P2, P3, u);
        private drawCatmull(canvas, points, xoffset);
        private makeCatmull(anchors);
        private drawPath(canvas, points, clearBeforeDraw);
    }
}
declare module TERRAIN {
    interface NoiseParameters {
        random: RandomProvider;
        width?: number;
        height?: number;
        canvas?: HTMLCanvasElement;
        param?: number;
        displayCanvas?: boolean;
    }
    class PerlinNoiseGenerator {
        public Canvas: HTMLCanvasElement;
        public Parameters: NoiseParameters;
        public Random: RandomProvider;
        private randomNoise(separateCanvas, displayCanvas);
        constructor(inParameters: NoiseParameters);
        public Generate(canvas?: HTMLCanvasElement, separateCanvas?: boolean): HTMLCanvasElement;
    }
}
declare module TERRAIN {
    interface ComplexNoiseGeneratorParameters {
        width?: number;
        height?: number;
        displayCanvas?: boolean;
        type?: number;
        depth?: number;
        steps?: ComplexNoiseGenStep[];
        minHeight?: number;
        maxHeight?: number;
        subdivisions?: number;
    }
    class ComplexNoiseGenerator {
        public Parameters: ComplexNoiseGeneratorParameters;
        public Canvas: HTMLCanvasElement;
        public DraftCanvases: {
            [canvasName: string]: HTMLCanvasElement;
        };
        public Steps: ComplexNoiseGenStep[];
        private _stepCounter;
        constructor(params: ComplexNoiseGeneratorParameters);
        public Generate(): HTMLCanvasElement;
        public AddStep(step: (terrainGen: ComplexNoiseGenerator) => boolean, tag?: string): void;
    }
    class ComplexNoiseGenStep {
        public _func: (terrainGen: ComplexNoiseGenerator) => boolean;
        public _tag: string;
        constructor(func: (terrainGen: ComplexNoiseGenerator) => boolean, tag: string);
        public Execute(executeOn: ComplexNoiseGenerator): boolean;
    }
}
declare var game: GAME.GameWorld;
