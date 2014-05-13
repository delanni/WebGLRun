module BABYLON {
    export module GameFX {

        export class AssetsManager {

            _scene: BABYLON.Scene;
            _gameEntitiesCollection: any[];
            _sceneReady: boolean;

            constructor(scene: BABYLON.Scene) {
                this._scene = scene;
                this._gameEntitiesCollection = [];
            }

            // called by gameEntity to indicate it has finished loading itself
            markEntityAsLoaded(indexEntity: number) {
                this._gameEntitiesCollection[indexEntity].isLoaded = true;

                var countIsLoaded = 0;
                for (var i = 0; i < this._gameEntitiesCollection.length; i++) {
                    if (this._gameEntitiesCollection[i].isLoaded == true) {
                        countIsLoaded++;
                    }
                }
                // If we've loaded all entities, we can now launch the game
                if (this._gameEntitiesCollection.length === countIsLoaded) {
                    this._scene.executeWhenReady(() => this._sceneReady = true);
                }
            }

            loadAllEntitiesAsync(sceneReady: boolean) {
                this._sceneReady = sceneReady;
                for (var i = 0; i < this._gameEntitiesCollection.length; i++) {
                    this._gameEntitiesCollection[i].entity.loadMesh(this._scene, null, i);
                }
            }

            // Return a cloned version of a previously loaded entity
            cloneLoadedEntity(typeEntity) {
                for (var i = 0; i < this._gameEntitiesCollection.length; i++) {
                    if (this._gameEntitiesCollection[i].type == typeEntity) {
                        return this._gameEntitiesCollection[i].entity.clone();
                    }
                }
            }

            push(gameEntityToAdd) {
                this._gameEntitiesCollection.push({ type: gameEntityToAdd.toString(), entity: gameEntityToAdd, isLoaded: false });
            }
        }


        export class Collection {
            count: number;
            collection: any;

            constructor() {
                this.count = 0;
                this.collection = {};
            }

            add = function (key, item) {
                if (this.collection[key] != undefined)
                    return undefined;
                this.collection[key] = item;
                return ++this.count
            }

            remove = function (key) {
                if (this.collection[key] == undefined)
                    return undefined;
                delete this.collection[key]
                return --this.count
            }

            item = function (key) {
                return this.collection[key];
            }

            forEach = function (block) {
                for (var key in this.collection) {
                    if (this.collection.hasOwnProperty(key)) {
                        block(this.collection[key]);
                    }
                }
            }
    }

        // Display HTML elements on top of canvas game
        export class Dashboard {
            renderCanvas: HTMLCanvasElement;
            loadingText: any;

            constructor() {
                this.renderCanvas = Cast<HTMLCanvasElement>(document.getElementById("renderCanvas"));
                if (this.renderCanvas != null) {
                    this.renderCanvas.style.display = "none";
                }
                this.loadingText = document.getElementById("loadingText");
                if (this.loadingText != null) {
                    this.loadingText.style.webkitTransform = "translateX(0px)";
                    this.loadingText.style.transform = "translateX(0px)";
                }
            }

            loading = function (evt) {
                if (this.loadingText != null) {
                    this.loadingText.innerHTML = "Loading, please wait..." + (evt.loaded * 100 / evt.total).toFixed() + "%";
                }

            };

            endGame = function () {
                if (this.loadingText != null) {
                    this.loadingText.innerHTML = "End Game";
                    this.loadingText.style.webkitTransform = "translateX(0px)";
                    this.loadingText.style.transform = "translateX(0px)";
                }
                if (this.renderCanvas != null) {
                    this.renderCanvas.style.display = "none";
                }
            }


            endLoading = function () {
                if (this.loadingText != null) {
                    this.loadingText.style.webkitTransform = "";
                    this.loadingText.style.transform = "";
                }
                if (this.renderCanvas != null) {
                    this.renderCanvas.style.display = "block";
                }
            }
            }


        // The base export class by all game entities
        export class GameEntity {
            _name: string;
            _url: string;
            _fileName: string;
            _gameWorld: BABYLON.GameFX.GameWorld;
            _hasCollisions: boolean;
            _descendantsCollision: boolean;
            _position: { x: number; y: number };
            _live: number;

            constructor(name: string, url: string, fileName: string, position: { x: number; y: number }, gameWorld: GameFX.GameWorld) {
                this._name = name;
                this._url = url;
                this._fileName = fileName;
                this._gameWorld = gameWorld;

                this._hasCollisions = false;
                this._descendantsCollision = false;

                this._position = position;
                this._live = 1;
                //Add World Entities
                this._gameWorld.entities.push(this);
            }

            setPosition = function (newPosition) {
                if (this._mesh) {
                    this._mesh.position = newPosition;
                }
            };

            setHasCollisions = function (hasCollision, descendantsCollision) {
                if (hasCollision === true) {
                    this._gameWorld.entitiesRegisterCollision.push(this);
                    this._descendantsCollision = descendantsCollision;
                }
                else {
                    var index = this._gameWorld.entitiesRegisterCollision.indexOf(this);
                    if (index !== -1) {
                        this._gameWorld.entitiesRegisterCollision.splice(index, 1);
                    }
                }
                this._hasCollisions = hasCollision;
            };

            getGameWorld = function () {
                return this._gameWorld;
            };

            initialize = function (manual) {
            }

            //Return {value: true / false, tag: object} 
            intersectBehavior = function () {
                return { value: false, tag: null };
            }

            collisionBehavior = function (entity, tag) {
                entity.damageBehavior(this._live);
            }

            damageBehavior = function (live) {
                return live;
            }

            getPosition = function () {
                if (this._mesh) {
                    return (this._mesh.position);
                } else {
                    return BABYLON.Vector3.Zero();
                }
            };

            markForRemove = function () {
                var index = this._gameWorld.entities.indexOf(this);
                if (index !== -1) {
                    if (this._gameWorld.entities[index]._mesh != null)
                        this._gameWorld.entities[index]._mesh.dispose();
                    this._gameWorld.entities.splice(index, 1);
                }
                index = this._gameWorld.entitiesRegisterCollision.indexOf(this);
                if (index !== -1) {
                    this._gameWorld.entitiesRegisterCollision.splice(index, 1);
                }
            };
        }


        export class GameEntity2D extends GameEntity {
            _angle: number;
            _size: number;

            constructor(name, url, fileName, position, angle, size, gameWorld) {
                super(name, url, fileName, position, gameWorld);
                this._angle = angle;
                this._size = size;
            }

            // Code à fixer? gerer un angle en degree sur la propriété y de la rotation
            getAngle = function (newAngle) {
                this._mesh.rotation.z = newAngle;
            };

            setAngle = function () {
                return (this._mesh.rotation.z);
            };

            setSize = function (newSize) {
                this._mesh.scaling.x = newSize;
                this._mesh.scaling.y = newSize;
                this._mesh.scaling.z = newSize;
            };

            getSize = function () {
                return (this._mesh.scaling.x);
            };
        }

        export class GameEntity3D extends GameEntity {
            _cloneable: boolean;
            _rotation: any;
            _scaling: any;
            _entityDirection: Vector3;
            assetManager: AssetsManager;
            _mesh: any;

            constructor(name, url, fileName, position, rotation, scaling, cloneable, gameWorld:GameWorld) {
                // Call the based constructor (GameEntity here)
                super(name, url, fileName, position, gameWorld);
                if (cloneable) {
                    this._cloneable = cloneable;
                } else {
                    this._cloneable = false;
                }
                this._rotation = rotation;
                this._scaling = scaling;
                this._entityDirection = BABYLON.Vector3.Zero();
                this.assetManager = new AssetsManager(gameWorld.scene);
            }

            setRotation(newRotation) {
                this._mesh.rotation = newRotation;
            }
            getRotation = function () {
                return (this._mesh.rotation);
            };
            setScaling = function (newScaling) {
                this._mesh.scaling = newScaling;
            };
            getScaling = function () {
                return (this._mesh.scaling);
            };
            loaded = function (meshes, particleSystems) {
            };

            onDispose = function (thisEntity) {
            };

            moveOnAxisRelativeToMesh = function (moveVector) {
                var entityTransform = BABYLON.Matrix.RotationYawPitchRoll(this._mesh.rotation.y, this._mesh.rotation.x, this._mesh.rotation.z);
                this._entityDirection = BABYLON.Vector3.TransformCoordinates(moveVector, entityTransform);
                this._mesh.position = this._mesh.position.add(this._entityDirection);
            };

            loadMesh = function (scene: Scene, callback, indexEntity) {
                BABYLON.SceneLoader.Load(this._url, this._fileName, scene.getEngine(), (meshes) =>
                {
                    this._mesh = meshes[0];
                    this._mesh.scaling = this._scaling;
                    if (this._position)
                        this._mesh.position = this._position;
                    this._mesh.rotation = this._rotation;
                    this._mesh.onDispose = this.onDispose;
                    // if this object will be the based on multiple instance
                    // the main reference won't be enabled. It will only be used to build
                    // clone objects
                    if (this._cloneable)
                        this._mesh.setEnabled(false);

                    //for (var index = 0; index < particleSystems.length; index++) {
                    //    particleSystems[index].minSize *= 0.05;
                    //    particleSystems[index].maxSize *= 0.05;
                    //}
                    this.isReady = true;
                    this.loaded(meshes);
                    this.initialize(false);
                    if (callback)
                        callback(this._mesh);

                    if (indexEntity != undefined) {
                        this.assetManager.markEntityAsLoaded(indexEntity);
                    }

                }, this._gameWorld.dashboard.loading, this._gameWorld.dashboard.endLoading );
            };

            _internalClone = function () {
                return new GameEntity3D(this._name, this._url, this._fileName, this._position.clone(), this._rotation.clone(), this._scaling.clone(), false, this._gameWorld);
            };

            clone = function () {
                var clonedObject = this._internalClone();
                clonedObject.isReady = true;
                clonedObject._mesh = this._mesh.clone();
                clonedObject._mesh.onDispose = this.onDispose;
                clonedObject._mesh.setEnabled(true);
                clonedObject.initialize(false);
                return clonedObject;
            };
        }

    

        export class KeyboardManager {
            _rotateOnAxisRelativeToMesh: boolean;
            _leftKeyCode: number;
            _rightKeyCode: number;
            _upKeyCode: number;
            _downKeyCode: number;
            _deltaValue: number;

            _keys: number[];
            _deltaVector: Vector3;

            _axisTargetedByLeftAndRight: string;
            _axisTargetedByUpAndDown: string;
            _deltaValueLeftAndRight: number;
            _deltaValueUpAndDown: number;
            reverseLeftRight: boolean;
            reverseUpDown: boolean;
            _rotationSpeed: number;
            _inverseRotationSpeed: number;

            constructor() {
                // There's 2 ways to move the entity binded to the keyboard:
                // 1 - By default: moving on the X,Y,Z axis of the world
                // 2 - If set to true: moving on the X,Y,Z axis of the Mesh
                // In the second option, we're computing the direction vector for you
                this._rotateOnAxisRelativeToMesh = false;
                // Default keyboard mapping is set to
                // the left, right, up, down arrow keys
                this._leftKeyCode = 37;
                this._rightKeyCode = 39;
                this._upKeyCode = 38;
                this._downKeyCode = 40;
                this._deltaValue = 0.1;
                this._keys = [];
                // Used to compute inertia to apply to the entity
                this._deltaVector = BABYLON.Vector3.Zero();
                // By default left & right arrow keys are moving the X
                // and up & down keys are moving the Y
                this._axisTargetedByLeftAndRight = "X";
                this._axisTargetedByUpAndDown = "Y";
                this._deltaValueLeftAndRight = 0;
                this._deltaValueUpAndDown = 0;
                this.reverseLeftRight = false;
                this.reverseUpDown = false;
                this._rotationSpeed = 25;
                this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
                //this._transform = new BABYLON.Vector3(0,0,0);

                window.addEventListener("keydown", function (evt) { this._onKeyDown(evt); }, false);
                window.addEventListener("keyup", function (evt) { this._onKeyUp(evt); }, false);
                window.addEventListener("blur", function () { this._keys = []; }, false);
            }

            // Default handlers to arrow keys will target X & Y coordinates
            _handleLeftKey = function () {
                if (this.reverseLeftRight)
                    this._deltaValueLeftAndRight += this._deltaValue;
                else
                    this._deltaValueLeftAndRight -= this._deltaValue;

            };
            _handleRightKey = function () {
                if (this.reverseLeftRight)
                    this._deltaValueLeftAndRight -= this._deltaValue;
                else
                    this._deltaValueLeftAndRight += this._deltaValue;

            };
            _handleUpKey = function () {
                if (this.reverseUpDown)
                    this._deltaValueUpAndDown -= this._deltaValue;
                else
                    this._deltaValueUpAndDown += this._deltaValue;

            };
            _handleDownKey = function () {
                if (this.reverseUpDown)
                    this._deltaValueUpAndDown += this._deltaValue;
                else
                    this._deltaValueUpAndDown -= this._deltaValue;
            };
            _handleKey = [function () { }];

            // if you want to change the mapping for the left, up, right, down 
            // you have to provide the keycode for each arrows key
            // Example: setBasicKeysCodes(81, 90, 68, 83) to map to Q,Z,D,S in AZERTY. 
            setBasicKeysCodes = function (leftCode, upCode, rightCode, downCode) {
                this._leftKeyCode = leftCode;
                this._upKeyCode = upCode;
                this._rightKeyCode = rightCode;
                this._downKeyCode = downCode;
            };

            // Set the left & right borders of the virtual 2D screen to test
            setMinMaxX = function (leftX, rightX) {
                this._minX = leftX;
                this._maxX = rightX;
            };

            // Set the up & down borders of the virtual 2D screen to test
            setMinMaxY = function (bottomY, topY) {
                this._minY = bottomY;
                this._maxY = topY;
            };

            // Set the up & down borders of the virtual 2D screen to test
            setMinMaxZ = function (minZ, maxZ) {
                this._minZ = minZ;
                this._maxZ = maxZ;
            };

            // Define which axis you'd like to control for left & right keys
            setAxisForLR = function (axisLetter) {
                switch (axisLetter) {
                    case "X":
                    case "Y":
                    case "Z":
                        this._axisTargetedByLeftAndRight = axisLetter;
                        break;
                    default:
                        this._axisTargetedByLeftAndRight = "X";
                        break;
                }
            };

            // Define which axis you'd like to control for up & down keys
            setAxisForUD = function (axisLetter) {
                switch (axisLetter) {
                    case "X":
                    case "Y":
                    case "Z":
                        this._axisTargetedByUpAndDown = axisLetter;
                        break;
                    default:
                        this._axisTargetedByUpAndDown = "Y";
                        break;
                }
            };

            // if you want to change the delta value added to each tick to the entity's position
            // it will then impact the movement speed
            setDeltaValue = function (value) {
                this._deltaValue = value;
            };

            // Call this function to connect the game entity you'd like to move with the keyboard
            connectTo = function (entityOrCameraToConnectTo) {
                if (entityOrCameraToConnectTo instanceof BABYLON.GameFX.GameEntity) {
                    this._gameEntityConnected = entityOrCameraToConnectTo;
                }
                if (entityOrCameraToConnectTo instanceof BABYLON.FreeCamera) {
                    this._cameraConnected = entityOrCameraToConnectTo;
                    entityOrCameraToConnectTo.checkCollisions = true;
                }
            };

            activateRotationOnAxisRelativeToMesh = function () {
                this._rotateOnAxisRelativeToMesh = true;
                // Default control are set to control rotation on Y axis with Left/Right and X axis on Up/Down
                this.setAxisForLR("Y");
                this.setAxisForUD("X");
            };

            activateMoveOnAxisRelativeToWorld = function () {
                this._rotateOnAxisRelativeToMesh = false;
                // Default control are set to control translation on X axis via Left/Right and on Y axis on Up/Down
                this.setAxisForLR("X");
                this.setAxisForUD("Y");
            };

            // If you want to override the default behavior set during the constructor
            // You should provide an array with the keycode, the associated function to callback and the addLogic boolean
            // {keycode: value, associatedBehavior: callbackFunction, addLogic: true/false}
            // addLogic is optionnal and considered to false by default
            //
            // Example: 
            // setKeysBehaviors([{ key: "left", associatedBehavior: function () { mainShip.moveLeft(); }, addLogic: false }]);
            // will call the function moveLeft() instead of trying to move the entity on the X axis
            //
            // setKeyBehaviors([{ key: 88, associatedBehavior: function () { mainShip.fire(); }}]);
            // will call the fire() function on the space key
            //
            // setKeysBehaviors([{ key: "left", associatedBehavior: function () { mainShip.handleLeft(); }, addLogic: true}]);
            // will move the entity first using the embedded logic and will call handleLeft() function after this
            setKeysBehaviors = function (behaviors) {
                if (behaviors.length > 0) {
                    for (var i = 0; i < behaviors.length; i++) {
                        switch (behaviors[i].key) {
                            case "left":
                                // If the addLogic boolean is set to false (default value),
                                // you will override the default handler
                                if (!behaviors[i].addLogic) {
                                    this._handleLeftKey = behaviors[i].associatedBehavior;
                                }
                                // Otherwise, your associated behavior will be called after
                                // the default one moving the 3D entity
                                else {
                                    this._handleLeftKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleLeftKey);
                                }
                                break;
                            case "right":
                                if (!behaviors[i].addLogic) {
                                    this._handleRightKey = behaviors[i].associatedBehavior;
                                }
                                else {
                                    this._handleRightKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleRightKey);
                                }
                                break;
                            case "up":
                                if (!behaviors[i].addLogic) {
                                    this._handleUpKey = behaviors[i].associatedBehavior;
                                }
                                else {
                                    this._handleUpKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleUpKey);
                                }
                                break;
                            case "down":
                                if (!behaviors[i].addLogic) {
                                    this._handleDownKey = behaviors[i].associatedBehavior;
                                }
                                else {
                                    this._handleDownKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleDownKey);
                                }
                                break;
                            default:
                                this._handleKey[behaviors[i].key] = behaviors[i].associatedBehavior;
                                break;
                        }
                    }
                }
            };

            // Called to add a new behavior this will be called after the default one set by the constructor
            addBehavior = function (behaviorToAdd, currentBehavior) {
                var originalBehavior = currentBehavior;
                var additionnalBehavior = behaviorToAdd;
                return function () {
                    originalBehavior.call(this);
                    additionnalBehavior();
                }
            };

            _onKeyDown = function (evt) {
                switch (evt.keyCode) {
                    case this._leftKeyCode: // Left
                    case this._upKeyCode: // Up
                    case this._rightKeyCode: // Right
                    case this._downKeyCode: // Down
                        var index = this._keys.indexOf(evt.keyCode);

                        if (index === -1) {
                            this._keys.push(evt.keyCode);
                        }
                        evt.preventDefault();
                        break;
                    default:
                        var index = this._keys.indexOf(evt.keyCode);

                        if (index === -1 && this._handleKey[evt.keyCode]) {
                            this._keys.push(evt.keyCode);
                            evt.preventDefault();
                        }
                        break;
                }
            };

            _onKeyUp = function (evt) {
                switch (evt.keyCode) {
                    case this._leftKeyCode: // Left
                    case this._upKeyCode: // Up
                    case this._rightKeyCode: // Right
                    case this._downKeyCode: // Down
                        var index = this._keys.indexOf(evt.keyCode);

                        if (index >= 0) {
                            this._keys.splice(index, 1);
                        }
                        evt.preventDefault();
                        break;
                    default:
                        var index = this._keys.indexOf(evt.keyCode);

                        if (index >= 0) {
                            this._keys.splice(index, 1);
                            evt.preventDefault();
                        }
                        break;
                }
            };

            setRotationSpeed = function (newRotationSpeed) {
                this._rotationSpeed = newRotationSpeed;
                this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
            };

            // Tick function this will be called by the hidden animation loop
            // of the GameWorld instance
            tick = function () {
                if (this._gameEntityConnected) {
                    var currentPosition = this._gameEntityConnected.getPosition();

                    for (var index = 0; index < this._keys.length; index++) {
                        var keyCode = this._keys[index];

                        switch (keyCode) {
                            case this._leftKeyCode:
                                // Left
                                this._handleLeftKey();
                                break;
                            case this._upKeyCode:
                                // Up
                                this._handleUpKey();
                                break;
                            case this._rightKeyCode:
                                // Right
                                this._handleRightKey();
                                break;
                            case this._downKeyCode:
                                // Down
                                this._handleDownKey();
                                break;
                            default:
                                var associatedBehavior = this._handleKey[keyCode];
                                if (associatedBehavior)
                                    associatedBehavior();
                        }
                    }
                    if (this._keys.length > 0) {
                        switch (this._axisTargetedByLeftAndRight) {
                            case "X":
                                this._deltaVector.x = this._deltaValueLeftAndRight;
                                break;
                            case "Y":
                                this._deltaVector.y = this._deltaValueLeftAndRight;
                                break;
                            case "Z":
                                this._deltaVector.z = this._deltaValueLeftAndRight;
                                break;
                        }
                        switch (this._axisTargetedByUpAndDown) {
                            case "X":
                                this._deltaVector.x = this._deltaValueUpAndDown;
                                break;
                            case "Y":
                                this._deltaVector.y = this._deltaValueUpAndDown;
                                break;
                            case "Z":
                                this._deltaVector.z = this._deltaValueUpAndDown;
                                break;
                        }
                    }

                    // Code to block the entity on a virtual 2D screen.
                    // Useful for 2D games (platformer, etc.) or 3D game like shoot'em'up
                    // Controlling left & right borders. 
                    if ((this._minX && this._deltaVector.x < 0 && currentPosition.x <= this._minX) ||
                        (this._maxX && this._deltaVector.x > 0 && currentPosition.x >= this._maxX)) {
                        this._deltaVector.x = 0;
                        this._deltaValueLeftAndRight = 0;
                    }

                    // Controlling up & down borders. 
                    if ((this._minY && this._deltaVector.y > 0 && currentPosition.y >= this._minY) ||
                        (this._maxY && this._deltaVector.y < 0 && currentPosition.y <= this._maxY)) {
                        this._deltaVector.y = 0;
                        this._deltaValueUpAndDown = 0;
                    }

                    // Controlling min Z & max Z borders. 
                    if ((this._minZ && this._deltaVector.z < 0 && currentPosition.z <= this._minZ) ||
                        (this._maxZ && this._deltaVector.z > 0 && currentPosition.z >= this._maxZ)) {
                        this._deltaVector.z = 0;
                    }

                    // Moving the entity
                    if (this._rotateOnAxisRelativeToMesh) {
                        switch (this._axisTargetedByLeftAndRight) {
                            case "X":
                                this._gameEntityConnected._mesh.rotation.x += this._deltaValueLeftAndRight / this._inverseRotationSpeed;
                                break;
                            case "Y":
                                this._gameEntityConnected._mesh.rotation.y += this._deltaValueLeftAndRight / this._inverseRotationSpeed;
                                break;
                            case "Z":
                                this._gameEntityConnected._mesh.rotation.z += this._deltaValueLeftAndRight / this._inverseRotationSpeed;
                                break;
                        }
                        switch (this._axisTargetedByUpAndDown) {
                            case "X":
                                this._gameEntityConnected._mesh.rotation.x += this._deltaValueUpAndDown / this._inverseRotationSpeed;
                                break;
                            case "Y":
                                this._gameEntityConnected._mesh.rotation.y += this._deltaValueUpAndDown / this._inverseRotationSpeed;
                                break;
                            case "Z":
                                this._gameEntityConnected._mesh.rotation.z += this._deltaValueUpAndDown / this._inverseRotationSpeed;
                                break;
                        }
                    }
                    else {
                        this._gameEntityConnected.setPosition(this._gameEntityConnected.getPosition().add(this._deltaVector));
                    }
                    // Adding inertia
                    this._deltaVector = this._deltaVector.scale(0.9);
                    this._deltaValueLeftAndRight *= 0.9;
                    this._deltaValueUpAndDown *= 0.9;
                }
            };

        }


        // Mainly based on these 2 articles : 
        // Creating an universal virtual touch joystick working for all Touch models thanks to Hand.JS : http://blogs.msdn.com/b/davrous/archive/2013/02/22/creating-an-universal-virtual-touch-joystick-working-for-all-touch-models-thanks-to-hand-js.aspx
        // & on Seb Lee-Delisle original work: http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/ 

        // shim layer with setTimeout fallback
        window.requestAnimationFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        export class VirtualJoystick {
            _canvas: HTMLCanvasElement;
            _canvasContext: CanvasRenderingContext2D;
            globalJoystickIndex: number;
            _leftJoystick: boolean;
            joystickIndex: number;
            _canvasWidth: number;
            _canvasHeight: number;
            _axisTargetedByLeftAndRight: string;
            _axisTargetedByUpAndDown: string;
            reverseLeftRight: boolean;
            reverseUpDown: boolean;
            _touches: BABYLON.GameFX.Collection;
            _deltaPosition: BABYLON.Vector3;
            _joystickSensibility: number;
            _inversedSensibility: number;
            _rotationSpeed: number;
            _inverseRotationSpeed: number;
            _rotateOnAxisRelativeToMesh: boolean;
            _action: any;
            halfWidth: number;
            halfHeight: number;
            _joystickPressed: boolean;
            _joystickColor: string;
            joystickPointerID: number;
            joystickPointerPos: BABYLON.Vector2;
            joystickPointerStartPos: BABYLON.Vector2;
            deltaJoystickVector: BABYLON.Vector2;


            constructor(leftJoystick: boolean) {
                this.globalJoystickIndex = this.globalJoystickIndex || 0;
                if (leftJoystick) {
                    this._leftJoystick = true;
                }
                else {
                    this._leftJoystick = false;
                }

                this.joystickIndex = this.globalJoystickIndex;
                this.globalJoystickIndex++;

                // By default left & right arrow keys are moving the X
                // and up & down keys are moving the Y
                this._axisTargetedByLeftAndRight = "X";
                this._axisTargetedByUpAndDown = "Y";

                this.reverseLeftRight = false;
                this.reverseUpDown = false;

                // collections of pointers
                this._touches = new BABYLON.GameFX.Collection();
                this._deltaPosition = BABYLON.Vector3.Zero();

                this._joystickSensibility = 25;
                this._inversedSensibility = 1 / (this._joystickSensibility / 1000);
                this._rotationSpeed = 25;
                this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
                this._rotateOnAxisRelativeToMesh = false;

                // injecting a canvas element on top of the canvas 3D game
                if (!this._canvas) {
                    this._canvas = document.createElement("canvas");
                    this._canvasWidth = window.innerWidth;
                    this._canvasHeight = window.innerHeight;
                    this._canvas.width = window.innerWidth;
                    this._canvas.height = window.innerHeight;
                    this._canvas.style.width = "100%";
                    this._canvas.style.height = "100%";
                    this._canvas.style.position = "absolute";
                    this._canvas.style.backgroundColor = "transparent";
                    this._canvas.style.top = "0px";
                    this._canvas.style.left = "0px";
                    this._canvas.style.zIndex = "10";
                    this._canvas.style.msTouchAction = "none";
                    this._canvasContext = this._canvas.getContext('2d');
                    this._canvasContext.strokeStyle = "#ffffff";
                    this._canvasContext.lineWidth = 2;
                    document.body.appendChild(this._canvas);
                }
                this.halfWidth = this._canvas.width / 2;
                this.halfHeight = this._canvas.height / 2;
                this._joystickPressed = false;
                // default joystick color
                this._joystickColor = "cyan";

                this.joystickPointerID = -1;
                // current joystick position
                this.joystickPointerPos = new BABYLON.Vector2(0, 0);
                // origin joystick position
                this.joystickPointerStartPos = new BABYLON.Vector2(0, 0);
                this.deltaJoystickVector = new BABYLON.Vector2(0, 0);

                this._canvas.addEventListener('pointerdown', (evt) => this.onPointerDown(evt), false);
                this._canvas.addEventListener('pointermove', (evt) => this.onPointerMove(evt), false);
                this._canvas.addEventListener('pointerup', (evt) => this.onPointerUp(evt), false);
                this._canvas.addEventListener('pointerout', (evt) => this.onPointerUp(evt), false);
                this._canvas.addEventListener("contextmenu", (e) => e.preventDefault(), false);
                requestAnimationFrame(() => this.drawVirtualJoystick());
            }

            setJoystickSensibility = function (newJoystickSensibility) {
                this._joystickSensibility = newJoystickSensibility;
                this._inversedSensibility = 1 / (this._joystickSensibility / 1000);
            };

            setRotationSpeed = function (newRotationSpeed) {
                this._rotationSpeed = newRotationSpeed;
                this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
            };

            onPointerDown = function (e) {
                var newPointer = { identifier: e.pointerId, x: e.clientX, y: e.clientY, type: this.givePointerType(e) };
                var positionOnScreenCondition;
                if (this._leftJoystick === true) {
                    positionOnScreenCondition = (e.clientX < this.halfWidth);
                }
                else {
                    positionOnScreenCondition = (e.clientX > this.halfWidth);
                }

                if (positionOnScreenCondition && this.joystickPointerID < 0) {
                    // First contact will be dedicated to the virtual joystick
                    this.joystickPointerID = e.pointerId;
                    this.joystickPointerStartPos.x = e.clientX;
                    this.joystickPointerStartPos.y = e.clientY;
                    this.joystickPointerPos = this.joystickPointerStartPos.clone();
                    this.deltaJoystickVector.x = 0;
                    this.deltaJoystickVector.y = 0;
                    this._joystickPressed = true;
                    this._touches.add(e.pointerId, newPointer);
                }
                else {
                    // You can only trigger the action buttons with a joystick declared
                    if (this.globalJoystickIndex < 2 && this._action) {
                        this._action();
                        this._touches.add(e.pointerId, newPointer);
                    }
                }
            };

            onPointerMove = function (e) {
                // If the current pointer is the one associated to the joystick (first touch contact)
                if (this.joystickPointerID == e.pointerId) {
                    this.joystickPointerPos.x = e.clientX;
                    this.joystickPointerPos.y = e.clientY;
                    this.deltaJoystickVector = this.joystickPointerPos.clone();
                    this.deltaJoystickVector = this.deltaJoystickVector.subtract(this.joystickPointerStartPos);

                    if (this._gameEntityConnected || this._cameraConnected) {
                        var directionLeftRight = this.reverseLeftRight ? -1 : 1;
                        var deltaJoystickX = directionLeftRight * this.deltaJoystickVector.x / this._inversedSensibility;
                        switch (this._axisTargetedByLeftAndRight) {
                            case "X":
                                this._deltaPosition.x = Math.min(1, Math.max(-1, deltaJoystickX));
                                break;
                            case "Y":
                                this._deltaPosition.y = Math.min(1, Math.max(-1, deltaJoystickX));
                                break;
                            case "Z":
                                this._deltaPosition.z = Math.min(1, Math.max(-1, deltaJoystickX));
                                break;
                        }
                        var directionUpDown = this.reverseUpDown ? 1 : -1;
                        var deltaJoystickY = directionUpDown * this.deltaJoystickVector.y / this._inversedSensibility;
                        switch (this._axisTargetedByUpAndDown) {
                            case "X":
                                this._deltaPosition.x = Math.min(1, Math.max(-1, deltaJoystickY));
                                break;
                            case "Y":
                                this._deltaPosition.y = Math.min(1, Math.max(-1, deltaJoystickY));
                                break;
                            case "Z":
                                this._deltaPosition.z = Math.min(1, Math.max(-1, deltaJoystickY));
                                break;
                        }
                    }
                }
                else {
                    if (this._touches.item(e.pointerId)) {
                        this._touches.item(e.pointerId).x = e.clientX;
                        this._touches.item(e.pointerId).y = e.clientY;
                    }
                }
            };

            tick = function () {
                if (this._gameEntityConnected) {
                    var currentPosition = this._gameEntityConnected.getPosition();

                    // Code to block the entity on a virtual 2D screen.
                    // Useful for 2D games (platformer, etc.) or 3D game like shoot'em'up
                    // Controlling left & right borders. 
                    if ((this._minX && this._deltaPosition.x < 0 && currentPosition.x <= this._minX) ||
                        (this._maxX && this._deltaPosition.x > 0 && currentPosition.x >= this._maxX)) {
                        this._deltaPosition.x = 0;
                    }

                    // Controlling up & down borders. 
                    if ((this._minY && this._deltaPosition.y > 0 && currentPosition.y >= this._minY) ||
                        (this._maxY && this._deltaPosition.y < 0 && currentPosition.y <= this._maxY)) {
                        this._deltaPosition.y = 0;
                    }

                    // Controlling min Z & max Z borders. 
                    if ((this._minZ && this._deltaPosition.z < 0 && currentPosition.z <= this._minZ) ||
                        (this._maxZ && this._deltaPosition.z > 0 && currentPosition.z >= this._maxZ)) {
                        this._deltaPosition.z = 0;
                    }

                    // Moving the entity
                    if (this._rotateOnAxisRelativeToMesh) {
                        switch (this._axisTargetedByLeftAndRight) {
                            case "X":
                                this._gameEntityConnected._mesh.rotation.x += this._deltaPosition.x / this._inverseRotationSpeed;
                                break;
                            case "Y":
                                this._gameEntityConnected._mesh.rotation.y += this._deltaPosition.y / this._inverseRotationSpeed;
                                break;
                            case "Z":
                                this._gameEntityConnected._mesh.rotation.z += this._deltaPosition.z / this._inverseRotationSpeed;
                                break;
                        }
                        switch (this._axisTargetedByUpAndDown) {
                            case "X":
                                this._gameEntityConnected._mesh.rotation.x += this._deltaPosition.x / this._inverseRotationSpeed;
                                break;
                            case "Y":
                                this._gameEntityConnected._mesh.rotation.y += this._deltaPosition.y / this._inverseRotationSpeed;
                                break;
                            case "Z":
                                this._gameEntityConnected._mesh.rotation.z += this._deltaPosition.z / this._inverseRotationSpeed;
                                break;
                        }
                    }
                    else {
                        this._gameEntityConnected.setPosition(this._gameEntityConnected.getPosition().add(this._deltaPosition));
                    }
                }
                if (this._cameraConnected) {
                    if (this._leftJoystick === true) {
                        var cameraTransform = BABYLON.Matrix.RotationYawPitchRoll(this._cameraConnected.rotation.y, this._cameraConnected.rotation.x, 0);
                        var deltaTransform = BABYLON.Vector3.TransformCoordinates(this._deltaPosition, cameraTransform);

                        this._cameraConnected.cameraDirection = this._cameraConnected.cameraDirection.add(deltaTransform);
                    }
                    else {
                        this._cameraConnected.cameraRotation = this._cameraConnected.cameraRotation.add(this._deltaPosition);
                    }
                }
                if (!this._joystickPressed) {
                    this._deltaPosition = this._deltaPosition.scale(0.9);
                }
            };

            onPointerUp = function (e) {
                if (this.joystickPointerID == e.pointerId) {
                    this.joystickPointerID = -1;
                    this._joystickPressed = false;
                }
                this.deltaJoystickVector.x = 0;
                this.deltaJoystickVector.y = 0;

                this._touches.remove(e.pointerId);
            };

            setJoystickColor = function (newColor) {
                this._joystickColor = newColor;
            };

            setActionOnTouch = function (action) {
                this._action = action;
            };

            // Define which axis you'd like to control for left & right keys
            setAxisForLR = function (axisLetter) {
                switch (axisLetter) {
                    case "X":
                    case "Y":
                    case "Z":
                        this._axisTargetedByLeftAndRight = axisLetter;
                        break;
                    default:
                        this._axisTargetedByLeftAndRight = "X";
                        break;
                }
            };

            // Define which axis you'd like to control for up & down keys
            setAxisForUD = function (axisLetter) {
                switch (axisLetter) {
                    case "X":
                    case "Y":
                    case "Z":
                        this._axisTargetedByUpAndDown = axisLetter;
                        break;
                    default:
                        this._axisTargetedByUpAndDown = "Y";
                        break;
                }
            };

            // Set the left & right borders of the virtual 2D screen to test
            setMinMaxX = function (leftX, rightX) {
                this._minX = leftX;
                this._maxX = rightX;
            };

            // Set the up & down borders of the virtual 2D screen to test
            setMinMaxY = function (bottomY, topY) {
                this._minY = bottomY;
                this._maxY = topY;
            };

            // Set the up & down borders of the virtual 2D screen to test
            setMinMaxZ = function (minZ, maxZ) {
                this._minZ = minZ;
                this._maxZ = maxZ;
            };

            drawVirtualJoystick = function () {
                this._canvasContext.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
                this._touches.forEach(function (touch) {
                    if (touch.identifier === this.joystickPointerID) {
                        this._canvasContext.beginPath();
                        this._canvasContext.strokeStyle = this._joystickColor;
                        this._canvasContext.lineWidth = 6;
                        this._canvasContext.arc(this.joystickPointerStartPos.x, this.joystickPointerStartPos.y, 40, 0, Math.PI * 2, true);
                        this._canvasContext.stroke();
                        this._canvasContext.beginPath();
                        this._canvasContext.strokeStyle = this._joystickColor;
                        this._canvasContext.lineWidth = 2;
                        this._canvasContext.arc(this.joystickPointerStartPos.x, this.joystickPointerStartPos.y, 60, 0, Math.PI * 2, true);
                        this._canvasContext.stroke();
                        this._canvasContext.beginPath();
                        this._canvasContext.strokeStyle = this._joystickColor;
                        this._canvasContext.arc(this.joystickPointerPos.x, this.joystickPointerPos.y, 40, 0, Math.PI * 2, true);
                        this._canvasContext.stroke();
                    }
                    else {
                        this._canvasContext.beginPath();
                        this._canvasContext.fillStyle = "white";
                        this._canvasContext.beginPath();
                        this._canvasContext.strokeStyle = "red";
                        this._canvasContext.lineWidth = "6";
                        this._canvasContext.arc(touch.x, touch.y, 40, 0, Math.PI * 2, true);
                        this._canvasContext.stroke();
                    };
                });
                requestAnimationFrame(function () {
                    this.drawVirtualJoystick();
                });
            };

            givePointerType = function (event) {
                switch (event.pointerType) {
                    case event.POINTER_TYPE_MOUSE:
                        return "MOUSE";
                        break;
                    case event.POINTER_TYPE_PEN:
                        return "PEN";
                        break;
                    case event.POINTER_TYPE_TOUCH:
                        return "TOUCH";
                        break;
                }
            };

            connectTo = function (entityOrCameraToConnectTo) {
                if (entityOrCameraToConnectTo instanceof BABYLON.GameFX.GameEntity) {
                    this._gameEntityConnected = entityOrCameraToConnectTo;
                    this.setJoystickSensibility(25);
                }
                if (entityOrCameraToConnectTo instanceof BABYLON.FreeCamera) {
                    if (this._leftJoystick === true) {
                        // By default we're setting FPS like controls Up/Down moving Z, Left/Right moving X
                        this.setAxisForUD("Z");
                        this.setAxisForLR("X");
                        this.setJoystickSensibility(2);
                    }
                    else {
                        // right joystick is moving the head/camera on rotation X (up/down) and rotation Y (left/right)
                        this.setAxisForUD("X");
                        this.setAxisForLR("Y");
                        this.reverseUpDown = true;
                        this.setJoystickSensibility(0.04);
                    }
                    this._cameraConnected = entityOrCameraToConnectTo;
                    entityOrCameraToConnectTo.checkCollisions = true;
                }
            };

            activateRotationOnAxisRelativeToMesh = function () {
                this._rotateOnAxisRelativeToMesh = true;
                // Default control are set to control rotation on Y axis with Left/Right and X axis on Up/Down
                this.setAxisForLR("Y");
                this.setAxisForUD("X");
            };

            activateMoveOnAxisRelativeToWorld = function () {
                this._rotateOnAxisRelativeToMesh = false;
                // Default control are set to control translation on X axis via Left/Right and on Y axis on Up/Down
                this.setAxisForLR("X");
                this.setAxisForUD("Y");
            };
        }
    }
}