declare module BABYLON {
    module GameFX {
        class AssetsManager {
            public _scene: Scene;
            public _gameEntitiesCollection: any[];
            public _sceneReady: boolean;
            constructor(scene: Scene);
            public markEntityAsLoaded(indexEntity: number): void;
            public loadAllEntitiesAsync(sceneReady: boolean): void;
            public cloneLoadedEntity(typeEntity: any): any;
            public push(gameEntityToAdd: any): void;
        }
        class Collection {
            public count: number;
            public collection: any;
            constructor();
            public add: (key: any, item: any) => number;
            public remove: (key: any) => number;
            public item: (key: any) => any;
            public forEach: (block: any) => void;
        }
        class Dashboard {
            public renderCanvas: HTMLCanvasElement;
            public loadingText: any;
            constructor();
            public loading: (evt: any) => void;
            public endGame: () => void;
            public endLoading: () => void;
        }
        class GameEntity {
            public _name: string;
            public _url: string;
            public _fileName: string;
            public _gameWorld: GameWorld;
            public _hasCollisions: boolean;
            public _descendantsCollision: boolean;
            public _position: {
                x: number;
                y: number;
            };
            public _live: number;
            constructor(name: string, url: string, fileName: string, position: {
                x: number;
                y: number;
            }, gameWorld: GameWorld);
            public setPosition: (newPosition: any) => void;
            public setHasCollisions: (hasCollision: any, descendantsCollision: any) => void;
            public getGameWorld: () => any;
            public initialize: (manual: any) => void;
            public intersectBehavior: () => {
                value: boolean;
                tag: any;
            };
            public collisionBehavior: (entity: any, tag: any) => void;
            public damageBehavior: (live: any) => any;
            public getPosition: () => any;
            public markForRemove: () => void;
        }
        class GameEntity2D extends GameEntity {
            public _angle: number;
            public _size: number;
            constructor(name: any, url: any, fileName: any, position: any, angle: any, size: any, gameWorld: any);
            public getAngle: (newAngle: any) => void;
            public setAngle: () => any;
            public setSize: (newSize: any) => void;
            public getSize: () => any;
        }
        class GameEntity3D extends GameEntity {
            public _cloneable: boolean;
            public _rotation: any;
            public _scaling: any;
            public _entityDirection: Vector3;
            public assetManager: AssetsManager;
            public _mesh: any;
            constructor(name: any, url: any, fileName: any, position: any, rotation: any, scaling: any, cloneable: any, gameWorld: GameWorld);
            public setRotation(newRotation: any): void;
            public getRotation: () => any;
            public setScaling: (newScaling: any) => void;
            public getScaling: () => any;
            public loaded: (meshes: any, particleSystems: any) => void;
            public onDispose: (thisEntity: any) => void;
            public moveOnAxisRelativeToMesh: (moveVector: any) => void;
            public loadMesh: (scene: Scene, callback: any, indexEntity: any) => void;
            public _internalClone: () => GameEntity3D;
            public clone: () => any;
        }
        class GameWorld {
            public canvas: HTMLCanvasElement;
            public engine: Engine;
            public scene: Scene;
            public camera: Camera;
            public light: Light;
            public assetsManager: AssetsManager;
            public dashboard: Dashboard;
            public entities: GameEntity[];
            public entitiesRegisterCollision: GameEntity[];
            public _entityToFollow: GameEntity;
            public _deltaCameraEntityToFollow: any;
            constructor(canvasId: string, fullify: string);
            public extendCanvas: (fullify: string) => void;
            public getEntityWithMesh: (mesh: any) => any;
            public renderLoop: () => void;
            public setCameraToFollowEntity: (entity: any, delta: any) => void;
            public setCameraPosition: (newCameraPosition: any) => void;
            public addKeyboard: () => any;
            public addLeftJoystick: () => any;
            public addRightJoystick: () => any;
            public startGameLoop: (callback: any) => void;
            public triggerTicksOnAllEntities: () => void;
            public collisionLoop: () => void;
            public getRay3D: (x: any, y: any) => any;
            public getVirtual2DWindowOnZ: (z: any) => {
                top: any;
                bottom: any;
            };
        }
        class KeyboardManager {
            public _rotateOnAxisRelativeToMesh: boolean;
            public _leftKeyCode: number;
            public _rightKeyCode: number;
            public _upKeyCode: number;
            public _downKeyCode: number;
            public _deltaValue: number;
            public _keys: number[];
            public _deltaVector: Vector3;
            public _axisTargetedByLeftAndRight: string;
            public _axisTargetedByUpAndDown: string;
            public _deltaValueLeftAndRight: number;
            public _deltaValueUpAndDown: number;
            public reverseLeftRight: boolean;
            public reverseUpDown: boolean;
            public _rotationSpeed: number;
            public _inverseRotationSpeed: number;
            constructor();
            public _handleLeftKey: () => void;
            public _handleRightKey: () => void;
            public _handleUpKey: () => void;
            public _handleDownKey: () => void;
            public _handleKey: {
                (): void;
            }[];
            public setBasicKeysCodes: (leftCode: any, upCode: any, rightCode: any, downCode: any) => void;
            public setMinMaxX: (leftX: any, rightX: any) => void;
            public setMinMaxY: (bottomY: any, topY: any) => void;
            public setMinMaxZ: (minZ: any, maxZ: any) => void;
            public setAxisForLR: (axisLetter: any) => void;
            public setAxisForUD: (axisLetter: any) => void;
            public setDeltaValue: (value: any) => void;
            public connectTo: (entityOrCameraToConnectTo: any) => void;
            public activateRotationOnAxisRelativeToMesh: () => void;
            public activateMoveOnAxisRelativeToWorld: () => void;
            public setKeysBehaviors: (behaviors: any) => void;
            public addBehavior: (behaviorToAdd: any, currentBehavior: any) => () => void;
            public _onKeyDown: (evt: any) => void;
            public _onKeyUp: (evt: any) => void;
            public setRotationSpeed: (newRotationSpeed: any) => void;
            public tick: () => void;
        }
        class VirtualJoystick {
            public _canvas: HTMLCanvasElement;
            public _canvasContext: CanvasRenderingContext2D;
            public globalJoystickIndex: number;
            public _leftJoystick: boolean;
            public joystickIndex: number;
            public _canvasWidth: number;
            public _canvasHeight: number;
            public _axisTargetedByLeftAndRight: string;
            public _axisTargetedByUpAndDown: string;
            public reverseLeftRight: boolean;
            public reverseUpDown: boolean;
            public _touches: Collection;
            public _deltaPosition: Vector3;
            public _joystickSensibility: number;
            public _inversedSensibility: number;
            public _rotationSpeed: number;
            public _inverseRotationSpeed: number;
            public _rotateOnAxisRelativeToMesh: boolean;
            public _action: any;
            public halfWidth: number;
            public halfHeight: number;
            public _joystickPressed: boolean;
            public _joystickColor: string;
            public joystickPointerID: number;
            public joystickPointerPos: Vector2;
            public joystickPointerStartPos: Vector2;
            public deltaJoystickVector: Vector2;
            constructor(leftJoystick: boolean);
            public setJoystickSensibility: (newJoystickSensibility: any) => void;
            public setRotationSpeed: (newRotationSpeed: any) => void;
            public onPointerDown: (e: any) => void;
            public onPointerMove: (e: any) => void;
            public tick: () => void;
            public onPointerUp: (e: any) => void;
            public setJoystickColor: (newColor: any) => void;
            public setActionOnTouch: (action: any) => void;
            public setAxisForLR: (axisLetter: any) => void;
            public setAxisForUD: (axisLetter: any) => void;
            public setMinMaxX: (leftX: any, rightX: any) => void;
            public setMinMaxY: (bottomY: any, topY: any) => void;
            public setMinMaxZ: (minZ: any, maxZ: any) => void;
            public drawVirtualJoystick: () => void;
            public givePointerType: (event: any) => string;
            public connectTo: (entityOrCameraToConnectTo: any) => void;
            public activateRotationOnAxisRelativeToMesh: () => void;
            public activateMoveOnAxisRelativeToWorld: () => void;
        }
    }
}
