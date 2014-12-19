/// <reference path="../declarations/socket.io-client.d.ts" />
declare module FILTERS {
    interface Rectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    class StackBlurFilter implements ICanvasFilter {
        _fullCanvas: boolean;
        _customRect: Rectangle;
        _radius: number;
        _useAlpha: boolean;
        constructor(radius: number, customRect?: Rectangle);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    function Upscale(canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement;
}
declare module FILTERS {
    class CopyOverwriteFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class AdditiveCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class InverseAdditiveCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class SubstractiveCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class DarknessCopyFilter implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        constructor(paramCanvas: HTMLCanvasElement);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
    class BleedFeed implements ICanvasFilter {
        _paramCanvas: HTMLCanvasElement;
        _isDarkFeed: boolean;
        _blurriness: number;
        _iterations: number;
        constructor(paramCanvas: HTMLCanvasElement, blurRadius: number, iterations: number, darkfeed?: boolean);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
}
declare module FILTERS {
    class HistogramEqFilter implements ICanvasFilter {
        _customRect: Rectangle;
        _from: number;
        _to: number;
        _eqFactor: number;
        constructor(from: number, to: number, eqFactor?: number);
        Check(canvas: HTMLCanvasElement): boolean;
        Apply(canvas: HTMLCanvasElement): HTMLCanvasElement;
    }
}
declare module FILTERS {
    interface ICanvasFilter {
        Check: (canvas: HTMLCanvasElement) => boolean;
        Apply: (canvas: HTMLCanvasElement) => HTMLCanvasElement;
    }
}
declare module GAME {
    var MODEL_ANIMATIONS: {
        [x: string]: ICharacterModelDictionary;
    };
}
declare module GAME {
    module SCENES {
        class SceneBuilder {
            _gameWorld: GameWorld;
            _scene: BABYLON.Scene;
            constructor(gameWorld: GameWorld);
            BuildScene(): BABYLON.Scene;
            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
            SetParameters(params: any): void;
        }
    }
}
declare module GAME {
    module SCENES {
        class TestScene extends SceneBuilder {
            constructor(gameWorld: GameWorld);
            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module GAME {
    module SCENES {
        interface GameParameters {
            character: string;
            name: string;
            isHost?: boolean;
            debug?: boolean;
            useFlatShading?: boolean;
        }
        class GameScene extends SceneBuilder {
            private _randomSeed;
            private _debug;
            private _useFlatShading;
            private _mapParams;
            private _character;
            private _flatShaderMat;
            private _weirdShaderMat;
            private _followPlayer;
            private _shadowGenerator;
            mainCamera: BABYLON.FollowCamera;
            startOrb: BABYLON.Mesh;
            endOrb: BABYLON.Mesh;
            mountains: BABYLON.Mesh;
            collectibles: BABYLON.Mesh[];
            player: Player;
            enemy: Player;
            constructor(gameWorld: GameWorld, parameters: GameParameters, mapParameters: TERRAIN.TerrainGeneratorParams);
            private addLightsAndCamera();
            private addSkyDome();
            private generateLandscape();
            private putStartAndEnd();
            CreatePlayer(meshName: string): Player;
            CreateEnemy(meshName: string): Player;
            private createShaders();
            private dropCollectibles();
            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module GAME {
    var ACCEPTED_KEYS: {};
    class GameWorld {
        engine: BABYLON.Engine;
        scene: BABYLON.Scene;
        camera: BABYLON.Camera;
        canvas: HTMLCanvasElement;
        private _gui;
        private _socket;
        private _scenes;
        private _lastPositionUpdate;
        player: Player;
        enemy: Player;
        collectibles: BABYLON.Mesh[];
        parameters: GameProperties;
        constructor(canvasId: string, parameters: GameProperties, socket: SocketIOClient.Socket, fullify?: string);
        Load(properties: GameProperties): UTILS.Chainable<any>;
        private emit(messageType, args);
        private hookSocketTo(controller);
        private hookKeyboardTo(controller);
        private appendHandlers(socket);
        StartRenderLoop(): void;
        private start();
        private stopGame(stopPlayer, stopEnemy);
        private applyParameters(guiParams);
        private buildScenes(parameters);
        private extendCanvas(fullify);
        private renderLoop();
        private loadScene(s);
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
        TERRAINGEN = 4,
        EXPLORE = 5,
    }
}
declare module GAME {
    interface ICharaceterAnimationProperties {
        start: number;
        end: number;
        speed: number;
        repeat: boolean;
    }
    interface ICharacterModelDictionary {
        RUN: ICharaceterAnimationProperties;
        STAY: ICharaceterAnimationProperties;
        JUMP: ICharaceterAnimationProperties;
        REVERSE: ICharaceterAnimationProperties;
        ScalingVector: BABYLON.Vector3;
    }
    class Player {
        private INTERSECTION_TRESHOLD;
        private BASE_ACCELERATION;
        private BASE_JUMP_POW;
        private LAND_COOLDOWN;
        private ROTATION_APPROXIMATOR;
        private TIMEFACTOR;
        private MINVECTOR;
        private MAXVECTOR;
        private GRAVITY;
        private _animationObject;
        private _scene;
        private _bottomVector;
        private _ray;
        private _ground;
        private _landTime;
        private _lastRescueTime;
        private _lastJumpTime;
        private _lastUpdateTime;
        private _latency;
        private _lastFrameFactor;
        private _totalFramesDuration;
        private _totalFramesCount;
        private _lastTickTime;
        Controller: any;
        CurrentRotation: number;
        mesh: BABYLON.Mesh;
        parent: BABYLON.Mesh;
        modelProperties: ICharacterModelDictionary;
        currentAnimation: BABYLON.Animatable;
        currentAnimationName: string;
        rotationMatrix: BABYLON.Matrix;
        velocity: BABYLON.Vector3;
        isOnGround: boolean;
        IsEnabled: boolean;
        targetPosition: BABYLON.Vector3;
        constructor(scene: BABYLON.Scene, ground: BABYLON.Mesh);
        Initialize(mesh: BABYLON.Mesh): void;
        PushUpdate(positionData: any): void;
        setEnabled(value: boolean): void;
        private gameLoop();
        private jump(power);
        private accelerate(force);
        private rescue();
        private rotate(rotationDirection);
        private evaluateKeyState(keys);
        private startAnimation(animationKey, force?);
        private stopAnimation();
    }
}
declare module GAME {
    module SCENES {
        class AnimalScene extends SceneBuilder {
            constructor(gameWorld: GameWorld);
            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module GAME {
    module SCENES {
        class ExploreScene extends SceneBuilder {
            _randomSeed: number;
            _debug: boolean;
            _useFlatShading: boolean;
            _mapParams: TERRAIN.TerrainGeneratorParams;
            _character: string;
            _flatShader: BABYLON.ShaderMaterial;
            collectibles: any;
            mainCamera: BABYLON.FollowCamera;
            followPlayer: boolean;
            startOrb: BABYLON.Mesh;
            endOrb: BABYLON.Mesh;
            mountains: BABYLON.Mesh;
            player: Player;
            constructor(gameWorld: GameWorld, parameters: GameParameters, mapParameters: TERRAIN.TerrainGeneratorParams);
            private addLightsAndCamera(scene);
            private addSkyDome(scene);
            private generateLandscape(scene);
            private putStartAndEnd(scene);
            private createPlayer(scene, meshName);
            private createFlatShader(scene);
            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module GAME {
    module SCENES {
        class TerrainGenScene extends SceneBuilder {
            _randomSeed: number;
            _debug: boolean;
            _useFlatShading: boolean;
            _mapParams: TERRAIN.TerrainGeneratorParams;
            constructor(gameWorld: GameWorld, parameters: GameParameters, mapParameters: TERRAIN.TerrainGeneratorParams);
            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene;
        }
    }
}
declare module dat {
    class GUI {
    }
}
interface GameProperties {
    sceneId: GAME.Scenes;
    gameParameters: GAME.SCENES.GameParameters;
    mapParameters: TERRAIN.TerrainGeneratorParams;
}
declare class GUI {
    private _gameWorld;
    private _gui;
    properties: GameProperties;
    constructor(gameWorld: GAME.GameWorld);
    Reload(): void;
    AttachTo(gameWorld: GAME.GameWorld): void;
    private setDefaults(defaults);
    private initialize();
}
declare module TERRAIN {
    interface HeightMapGeneratorParams extends NoiseParameters {
        destructionLevel?: number;
        pathTopOffset?: number;
        pathBottomOffset?: number;
        shrink?: number;
        eqFactor?: number;
        heightmap?: string;
    }
    class HeightMapGenerator {
        Parameters: HeightMapGeneratorParams;
        Canvas: HTMLCanvasElement;
        constructor(params: HeightMapGeneratorParams);
        GenerateHeightMap(): HTMLCanvasElement;
    }
}
declare function CreateCanvas(inWidth: number, inHeight: number, debug?: boolean, id?: string, preAddModifications?: (canvas: HTMLCanvasElement) => void): HTMLCanvasElement;
declare function Cast<T>(item: any): T;
declare function GetDataOfCanvas(index: number): any;
declare function Trace(message: string): void;
interface IRandomProvider {
    Random: () => number;
}
declare class MersenneTwister implements IRandomProvider {
    private N;
    private M;
    private MATRIX_A;
    private UPPER_MASK;
    private LOWER_MASK;
    private mt;
    private mti;
    Random(): number;
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
    class PathGenerator {
        random: IRandomProvider;
        pathWidth: number;
        constructor(random: IRandomProvider, pathWidth: number);
        MakePath(canvas: HTMLCanvasElement, fromX?: number, toX?: number, fromY?: number, toY?: number, opaque?: boolean): HTMLCanvasElement;
        GenerateControlPoints(canvas: HTMLCanvasElement, fromX?: number, toX?: number, fromY?: number, toY?: number): any[];
        private interpolate(P0, P1, P2, P3, u);
        private drawCatmull(canvas, points, xoffset);
        MakeCatmull(anchors: any[]): any[];
        private drawPath(canvas, points, clearBeforeDraw);
    }
}
declare module TERRAIN {
    interface NoiseParameters {
        randomSeed: number;
        width: number;
        height: number;
        param: number;
        displayCanvas: boolean;
    }
    class PerlinNoiseGenerator {
        Canvas: HTMLCanvasElement;
        Parameters: NoiseParameters;
        Random: IRandomProvider;
        private randomNoise(separateCanvas, displayCanvas);
        constructor(inParameters: NoiseParameters);
        Generate(canvas?: HTMLCanvasElement, separateCanvas?: boolean): HTMLCanvasElement;
    }
}
declare module TERRAIN {
    interface TerrainGeneratorParams extends HeightMapGeneratorParams {
        subdivisions: number;
        randomSeed: number;
        minHeight: number;
        maxHeight: number;
        colors?: any[];
    }
    class TerrainGenerator {
        private _maxHeight;
        private _minHeight;
        private _gradientBase;
        private _gradient;
        Parameters: TerrainGeneratorParams;
        constructor(params: TerrainGeneratorParams);
        private getHeightColorFor(height);
        ColorizeMesh(mesh: BABYLON.Mesh): void;
        GenerateWrappingMesh(mesh: BABYLON.Mesh, scene: BABYLON.Scene): BABYLON.Mesh;
        ConvertNoiseToBabylonMesh(noise: HTMLCanvasElement, scene: BABYLON.Scene): BABYLON.Mesh;
    }
}
declare module TERRAIN {
    class ComplexNoiseGenerator {
        DraftCanvases: {
            [x: string]: HTMLCanvasElement;
        };
        Steps: ComplexNoiseGenStep[];
        private _stepCounter;
        OutCanvas: any;
        constructor();
        GenerateOn(canvas: HTMLCanvasElement): HTMLCanvasElement;
        AddStep(step: (terrainGen: ComplexNoiseGenerator) => boolean, tag?: string): void;
    }
    class ComplexNoiseGenStep {
        _func: (terrainGen: ComplexNoiseGenerator) => boolean;
        _tag: string;
        constructor(func: (terrainGen: ComplexNoiseGenerator) => boolean, tag: string);
        Execute(executeOn: ComplexNoiseGenerator): boolean;
    }
}
declare module UTILS {
    function Clamp(scalar: number, min: number, max: number): number;
    function Mixin(mixThis: any, toThis: any, dontTouchExistingProperties: any): any;
    class Chainable<T> {
        callbacks: {
            (argument: T): T;
        }[];
        constructor(followup?: (argument: T) => T);
        then(followup: (argument: T) => T): Chainable<T>;
        call(): IArguments;
    }
}
