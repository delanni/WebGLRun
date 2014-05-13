var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        var AssetsManager = (function () {
            function AssetsManager(scene) {
                this._scene = scene;
                this._gameEntitiesCollection = [];
            }
            // called by gameEntity to indicate it has finished loading itself
            AssetsManager.prototype.markEntityAsLoaded = function (indexEntity) {
                var _this = this;
                this._gameEntitiesCollection[indexEntity].isLoaded = true;

                var countIsLoaded = 0;
                for (var i = 0; i < this._gameEntitiesCollection.length; i++) {
                    if (this._gameEntitiesCollection[i].isLoaded == true) {
                        countIsLoaded++;
                    }
                }

                // If we've loaded all entities, we can now launch the game
                if (this._gameEntitiesCollection.length === countIsLoaded) {
                    this._scene.executeWhenReady(function () {
                        return _this._sceneReady = true;
                    });
                }
            };

            AssetsManager.prototype.loadAllEntitiesAsync = function (sceneReady) {
                this._sceneReady = sceneReady;
                for (var i = 0; i < this._gameEntitiesCollection.length; i++) {
                    this._gameEntitiesCollection[i].entity.loadMesh(this._scene, null, i);
                }
            };

            // Return a cloned version of a previously loaded entity
            AssetsManager.prototype.cloneLoadedEntity = function (typeEntity) {
                for (var i = 0; i < this._gameEntitiesCollection.length; i++) {
                    if (this._gameEntitiesCollection[i].type == typeEntity) {
                        return this._gameEntitiesCollection[i].entity.clone();
                    }
                }
            };

            AssetsManager.prototype.push = function (gameEntityToAdd) {
                this._gameEntitiesCollection.push({ type: gameEntityToAdd.toString(), entity: gameEntityToAdd, isLoaded: false });
            };
            return AssetsManager;
        })();
        GameFX.AssetsManager = AssetsManager;

        var Collection = (function () {
            function Collection() {
                this.add = function (key, item) {
                    if (this.collection[key] != undefined)
                        return undefined;
                    this.collection[key] = item;
                    return ++this.count;
                };
                this.remove = function (key) {
                    if (this.collection[key] == undefined)
                        return undefined;
                    delete this.collection[key];
                    return --this.count;
                };
                this.item = function (key) {
                    return this.collection[key];
                };
                this.forEach = function (block) {
                    for (var key in this.collection) {
                        if (this.collection.hasOwnProperty(key)) {
                            block(this.collection[key]);
                        }
                    }
                };
                this.count = 0;
                this.collection = {};
            }
            return Collection;
        })();
        GameFX.Collection = Collection;

        // Display HTML elements on top of canvas game
        var Dashboard = (function () {
            function Dashboard() {
                this.loading = function (evt) {
                    if (this.loadingText != null) {
                        this.loadingText.innerHTML = "Loading, please wait..." + (evt.loaded * 100 / evt.total).toFixed() + "%";
                    }
                };
                this.endGame = function () {
                    if (this.loadingText != null) {
                        this.loadingText.innerHTML = "End Game";
                        this.loadingText.style.webkitTransform = "translateX(0px)";
                        this.loadingText.style.transform = "translateX(0px)";
                    }
                    if (this.renderCanvas != null) {
                        this.renderCanvas.style.display = "none";
                    }
                };
                this.endLoading = function () {
                    if (this.loadingText != null) {
                        this.loadingText.style.webkitTransform = "";
                        this.loadingText.style.transform = "";
                    }
                    if (this.renderCanvas != null) {
                        this.renderCanvas.style.display = "block";
                    }
                };
                this.renderCanvas = Cast(document.getElementById("renderCanvas"));
                if (this.renderCanvas != null) {
                    this.renderCanvas.style.display = "none";
                }
                this.loadingText = document.getElementById("loadingText");
                if (this.loadingText != null) {
                    this.loadingText.style.webkitTransform = "translateX(0px)";
                    this.loadingText.style.transform = "translateX(0px)";
                }
            }
            return Dashboard;
        })();
        GameFX.Dashboard = Dashboard;

        // The base export class by all game entities
        var GameEntity = (function () {
            function GameEntity(name, url, fileName, position, gameWorld) {
                this.setPosition = function (newPosition) {
                    if (this._mesh) {
                        this._mesh.position = newPosition;
                    }
                };
                this.setHasCollisions = function (hasCollision, descendantsCollision) {
                    if (hasCollision === true) {
                        this._gameWorld.entitiesRegisterCollision.push(this);
                        this._descendantsCollision = descendantsCollision;
                    } else {
                        var index = this._gameWorld.entitiesRegisterCollision.indexOf(this);
                        if (index !== -1) {
                            this._gameWorld.entitiesRegisterCollision.splice(index, 1);
                        }
                    }
                    this._hasCollisions = hasCollision;
                };
                this.getGameWorld = function () {
                    return this._gameWorld;
                };
                this.initialize = function (manual) {
                };
                //Return {value: true / false, tag: object}
                this.intersectBehavior = function () {
                    return { value: false, tag: null };
                };
                this.collisionBehavior = function (entity, tag) {
                    entity.damageBehavior(this._live);
                };
                this.damageBehavior = function (live) {
                    return live;
                };
                this.getPosition = function () {
                    if (this._mesh) {
                        return (this._mesh.position);
                    } else {
                        return BABYLON.Vector3.Zero();
                    }
                };
                this.markForRemove = function () {
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
            return GameEntity;
        })();
        GameFX.GameEntity = GameEntity;

        var GameEntity2D = (function (_super) {
            __extends(GameEntity2D, _super);
            function GameEntity2D(name, url, fileName, position, angle, size, gameWorld) {
                _super.call(this, name, url, fileName, position, gameWorld);
                // Code à fixer? gerer un angle en degree sur la propriété y de la rotation
                this.getAngle = function (newAngle) {
                    this._mesh.rotation.z = newAngle;
                };
                this.setAngle = function () {
                    return (this._mesh.rotation.z);
                };
                this.setSize = function (newSize) {
                    this._mesh.scaling.x = newSize;
                    this._mesh.scaling.y = newSize;
                    this._mesh.scaling.z = newSize;
                };
                this.getSize = function () {
                    return (this._mesh.scaling.x);
                };
                this._angle = angle;
                this._size = size;
            }
            return GameEntity2D;
        })(GameEntity);
        GameFX.GameEntity2D = GameEntity2D;

        var GameEntity3D = (function (_super) {
            __extends(GameEntity3D, _super);
            function GameEntity3D(name, url, fileName, position, rotation, scaling, cloneable, gameWorld) {
                // Call the based constructor (GameEntity here)
                _super.call(this, name, url, fileName, position, gameWorld);
                this.getRotation = function () {
                    return (this._mesh.rotation);
                };
                this.setScaling = function (newScaling) {
                    this._mesh.scaling = newScaling;
                };
                this.getScaling = function () {
                    return (this._mesh.scaling);
                };
                this.loaded = function (meshes, particleSystems) {
                };
                this.onDispose = function (thisEntity) {
                };
                this.moveOnAxisRelativeToMesh = function (moveVector) {
                    var entityTransform = BABYLON.Matrix.RotationYawPitchRoll(this._mesh.rotation.y, this._mesh.rotation.x, this._mesh.rotation.z);
                    this._entityDirection = BABYLON.Vector3.TransformCoordinates(moveVector, entityTransform);
                    this._mesh.position = this._mesh.position.add(this._entityDirection);
                };
                this.loadMesh = function (scene, callback, indexEntity) {
                    var _this = this;
                    BABYLON.SceneLoader.Load(this._url, this._fileName, scene.getEngine(), function (meshes) {
                        _this._mesh = meshes[0];
                        _this._mesh.scaling = _this._scaling;
                        if (_this._position)
                            _this._mesh.position = _this._position;
                        _this._mesh.rotation = _this._rotation;
                        _this._mesh.onDispose = _this.onDispose;

                        // if this object will be the based on multiple instance
                        // the main reference won't be enabled. It will only be used to build
                        // clone objects
                        if (_this._cloneable)
                            _this._mesh.setEnabled(false);

                        //for (var index = 0; index < particleSystems.length; index++) {
                        //    particleSystems[index].minSize *= 0.05;
                        //    particleSystems[index].maxSize *= 0.05;
                        //}
                        _this.isReady = true;
                        _this.loaded(meshes);
                        _this.initialize(false);
                        if (callback)
                            callback(_this._mesh);

                        if (indexEntity != undefined) {
                            _this.assetManager.markEntityAsLoaded(indexEntity);
                        }
                    }, this._gameWorld.dashboard.loading, this._gameWorld.dashboard.endLoading);
                };
                this._internalClone = function () {
                    return new GameEntity3D(this._name, this._url, this._fileName, this._position.clone(), this._rotation.clone(), this._scaling.clone(), false, this._gameWorld);
                };
                this.clone = function () {
                    var clonedObject = this._internalClone();
                    clonedObject.isReady = true;
                    clonedObject._mesh = this._mesh.clone();
                    clonedObject._mesh.onDispose = this.onDispose;
                    clonedObject._mesh.setEnabled(true);
                    clonedObject.initialize(false);
                    return clonedObject;
                };
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
            GameEntity3D.prototype.setRotation = function (newRotation) {
                this._mesh.rotation = newRotation;
            };
            return GameEntity3D;
        })(GameEntity);
        GameFX.GameEntity3D = GameEntity3D;

        var GameWorld = (function () {
            function GameWorld(canvasId, fullify) {
                this.extendCanvas = function (fullify) {
                    var parent = this.canvas.parentElement;

                    var hardResize = fullify == "hard";
                    var _world = this;
                    var resize = function () {
                        if (hardResize) {
                            _world.canvas.width = _world.canvas.parentElement.clientWidth;
                            _world.canvas.height = _world.canvas.parentElement.clientHeight;
                            _world.engine.resize();
                        } else {
                            _world.canvas.style["width"] = "100%";
                            _world.canvas.style["height"] = "100%";
                        }
                    };

                    window.onresize = resize;
                    resize();
                };
                this.getEntityWithMesh = function (mesh) {
                    for (var i = 0; i < this.entities.length; i++) {
                        if (this.entities[i]._ == mesh) {
                            return this.entities[i];
                        }
                    }
                    return null;
                };
                this.renderLoop = function () {
                    this.engine.beginFrame();
                    this.scene.render();
                    this.engine.endFrame();
                    BABYLON.Tools.QueueNewFrame(function () {
                        this.renderLoop();
                    });
                };
                this.setCameraToFollowEntity = function (entity, delta) {
                    this._entityToFollow = entity;
                    this._deltaCameraEntityToFollow = delta;
                };
                this.setCameraPosition = function (newCameraPosition) {
                    this.camera.position = newCameraPosition;
                };
                this.addKeyboard = function () {
                    this.Keyboard = new BABYLON.GameFX.KeyboardManager();
                    return this.Keyboard;
                };
                this.addLeftJoystick = function () {
                    this.LeftJoystick = new BABYLON.GameFX.VirtualJoystick(true);
                    return this.LeftJoystick;
                };
                this.addRightJoystick = function () {
                    this.RightJoystick = new BABYLON.GameFX.VirtualJoystick(false);
                    return this.RightJoystick;
                };
                // Add a callback function if you'd like to add your own logic on each tick
                this.startGameLoop = function (callback) {
                    this.scene.beforeRender = function () {
                        if (this.Keyboard)
                            this.Keyboard.tick();
                        if (this.LeftJoystick)
                            this.LeftJoystick.tick();
                        if (this.RightJoystick)
                            this.RightJoystick.tick();
                        this.triggerTicksOnAllEntities();
                        this.collisionLoop();
                        if (callback)
                            callback();

                        //if cameraFollowEntity
                        if (this._entityToFollow != null) {
                            var entityTransform = BABYLON.Matrix.RotationYawPitchRoll(this._entityToFollow._mesh.rotation.y, this._entityToFollow._mesh.rotation.x, this._entityToFollow._mesh.rotation.z);
                            var cameraDirection = BABYLON.Vector3.TransformCoordinates(this._deltaCameraEntityToFollow, entityTransform);

                            this.camera.position = this._entityToFollow._mesh.position.add(cameraDirection);
                            this.camera.setTarget(this._entityToFollow._mesh.position);
                        }
                    };
                };
                this.triggerTicksOnAllEntities = function () {
                    for (var i = 0; i < this.entities.length; i++) {
                        if (this.entities[i].tick) {
                            this.entities[i].tick();
                        }
                    }
                };
                this.collisionLoop = function () {
                    var behaviorsCollection = [];

                    for (var i = 0; i < this.entitiesRegisterCollision.length; i++) {
                        for (var j = 0; j < this.entities.length; j++) {
                            if ((this.entities[j]._hasCollisions) && (this.entities[j] != this.entitiesRegisterCollision[i])) {
                                // Pure intersection on 3D Meshes
                                if (this.entitiesRegisterCollision[i]._mesh.intersectsMesh(this.entities[j]._mesh, false)) {
                                    behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j] });
                                }

                                // Extends 3D collision with a custom behavior (used for particules emitted for instance)
                                if (this.entitiesRegisterCollision[i]._descendantsCollision) {
                                    var descendants = this.entitiesRegisterCollision[i]._mesh.getDescendants();
                                    for (var k = 0; k < descendants.length; k++) {
                                        if (descendants[k].intersectsMesh(this.entities[j]._mesh, false)) {
                                            behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], descendants: descendants[k] });
                                        }
                                    }
                                }

                                //Intersects Behaviors
                                var intersectBehavior = this.entitiesRegisterCollision[i].intersectBehavior(this.entities[j]);
                                if (intersectBehavior.value) {
                                    behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], tag: intersectBehavior.tag });
                                }
                            }
                        }
                    }

                    for (var k = 0; k < behaviorsCollection.length; k++) {
                        if ((behaviorsCollection[k].registeredEntity) != null)
                            behaviorsCollection[k].registeredEntity.collisionBehavior(behaviorsCollection[k].targetEntity, behaviorsCollection[k]);
                        if ((behaviorsCollection[k].targetEntity) != null)
                            behaviorsCollection[k].targetEntity.collisionBehavior(behaviorsCollection[k].registeredEntity, behaviorsCollection[k]);
                    }

                    behaviorsCollection = [];
                };
                this.getRay3D = function (x, y) {
                    return this.scene.createPickingRay(x, y);
                };
                // If you need to know the max X & Y where your 3D mesh will be visible on screen
                // Use this function passing the current Z level where you entity lives
                // It's useful when you need to "think" in a 2D equivalent
                this.getVirtual2DWindowOnZ = function (z) {
                    // Getting virtual left top border
                    var rayTop = this.getRay3D(0, 0);
                    var rayBottom = this.getRay3D(this.scene.getEngine().getRenderWidth(), this.scene.getEngine().getRenderHeight());

                    var top = rayTop.origin.add(rayTop.direction.scale(z));
                    var bottom = rayBottom.origin.add(rayBottom.direction.scale(z));

                    return { top: top, bottom: bottom };
                };
                this.canvas = Cast(document.getElementById(canvasId));
                this.engine = new BABYLON.Engine(this.canvas, true);
                if (fullify) {
                    this.extendCanvas(fullify);
                }
                this.scene = new BABYLON.Scene(this.engine);
                this.camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, -30), this.scene);
                this.scene.activeCamera = this.camera;
                this.light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), this.scene);
                this.assetsManager = new BABYLON.GameFX.AssetsManager(this.scene);
                this.dashboard = new BABYLON.GameFX.Dashboard();

                // All Entities Collection
                this.entities = [];

                // Entities on which we'd like to test collisions
                this.entitiesRegisterCollision = [];

                // Camera used to automatically follow an entity
                this._entityToFollow = null;
                this._deltaCameraEntityToFollow = null;

                BABYLON.Tools.QueueNewFrame(function () {
                    this.renderLoop();
                });
            }
            return GameWorld;
        })();
        GameFX.GameWorld = GameWorld;

        var KeyboardManager = (function () {
            function KeyboardManager() {
                // Default handlers to arrow keys will target X & Y coordinates
                this._handleLeftKey = function () {
                    if (this.reverseLeftRight)
                        this._deltaValueLeftAndRight += this._deltaValue;
                    else
                        this._deltaValueLeftAndRight -= this._deltaValue;
                };
                this._handleRightKey = function () {
                    if (this.reverseLeftRight)
                        this._deltaValueLeftAndRight -= this._deltaValue;
                    else
                        this._deltaValueLeftAndRight += this._deltaValue;
                };
                this._handleUpKey = function () {
                    if (this.reverseUpDown)
                        this._deltaValueUpAndDown -= this._deltaValue;
                    else
                        this._deltaValueUpAndDown += this._deltaValue;
                };
                this._handleDownKey = function () {
                    if (this.reverseUpDown)
                        this._deltaValueUpAndDown += this._deltaValue;
                    else
                        this._deltaValueUpAndDown -= this._deltaValue;
                };
                this._handleKey = [function () {
                    }];
                // if you want to change the mapping for the left, up, right, down
                // you have to provide the keycode for each arrows key
                // Example: setBasicKeysCodes(81, 90, 68, 83) to map to Q,Z,D,S in AZERTY.
                this.setBasicKeysCodes = function (leftCode, upCode, rightCode, downCode) {
                    this._leftKeyCode = leftCode;
                    this._upKeyCode = upCode;
                    this._rightKeyCode = rightCode;
                    this._downKeyCode = downCode;
                };
                // Set the left & right borders of the virtual 2D screen to test
                this.setMinMaxX = function (leftX, rightX) {
                    this._minX = leftX;
                    this._maxX = rightX;
                };
                // Set the up & down borders of the virtual 2D screen to test
                this.setMinMaxY = function (bottomY, topY) {
                    this._minY = bottomY;
                    this._maxY = topY;
                };
                // Set the up & down borders of the virtual 2D screen to test
                this.setMinMaxZ = function (minZ, maxZ) {
                    this._minZ = minZ;
                    this._maxZ = maxZ;
                };
                // Define which axis you'd like to control for left & right keys
                this.setAxisForLR = function (axisLetter) {
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
                this.setAxisForUD = function (axisLetter) {
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
                this.setDeltaValue = function (value) {
                    this._deltaValue = value;
                };
                // Call this function to connect the game entity you'd like to move with the keyboard
                this.connectTo = function (entityOrCameraToConnectTo) {
                    if (entityOrCameraToConnectTo instanceof BABYLON.GameFX.GameEntity) {
                        this._gameEntityConnected = entityOrCameraToConnectTo;
                    }
                    if (entityOrCameraToConnectTo instanceof BABYLON.FreeCamera) {
                        this._cameraConnected = entityOrCameraToConnectTo;
                        entityOrCameraToConnectTo.checkCollisions = true;
                    }
                };
                this.activateRotationOnAxisRelativeToMesh = function () {
                    this._rotateOnAxisRelativeToMesh = true;

                    // Default control are set to control rotation on Y axis with Left/Right and X axis on Up/Down
                    this.setAxisForLR("Y");
                    this.setAxisForUD("X");
                };
                this.activateMoveOnAxisRelativeToWorld = function () {
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
                this.setKeysBehaviors = function (behaviors) {
                    if (behaviors.length > 0) {
                        for (var i = 0; i < behaviors.length; i++) {
                            switch (behaviors[i].key) {
                                case "left":
                                    // If the addLogic boolean is set to false (default value),
                                    // you will override the default handler
                                    if (!behaviors[i].addLogic) {
                                        this._handleLeftKey = behaviors[i].associatedBehavior;
                                    } else {
                                        this._handleLeftKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleLeftKey);
                                    }
                                    break;
                                case "right":
                                    if (!behaviors[i].addLogic) {
                                        this._handleRightKey = behaviors[i].associatedBehavior;
                                    } else {
                                        this._handleRightKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleRightKey);
                                    }
                                    break;
                                case "up":
                                    if (!behaviors[i].addLogic) {
                                        this._handleUpKey = behaviors[i].associatedBehavior;
                                    } else {
                                        this._handleUpKey = this.addBehavior(behaviors[i].associatedBehavior, this._handleUpKey);
                                    }
                                    break;
                                case "down":
                                    if (!behaviors[i].addLogic) {
                                        this._handleDownKey = behaviors[i].associatedBehavior;
                                    } else {
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
                this.addBehavior = function (behaviorToAdd, currentBehavior) {
                    var originalBehavior = currentBehavior;
                    var additionnalBehavior = behaviorToAdd;
                    return function () {
                        originalBehavior.call(this);
                        additionnalBehavior();
                    };
                };
                this._onKeyDown = function (evt) {
                    switch (evt.keyCode) {
                        case this._leftKeyCode:
                        case this._upKeyCode:
                        case this._rightKeyCode:
                        case this._downKeyCode:
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
                this._onKeyUp = function (evt) {
                    switch (evt.keyCode) {
                        case this._leftKeyCode:
                        case this._upKeyCode:
                        case this._rightKeyCode:
                        case this._downKeyCode:
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
                this.setRotationSpeed = function (newRotationSpeed) {
                    this._rotationSpeed = newRotationSpeed;
                    this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
                };
                // Tick function this will be called by the hidden animation loop
                // of the GameWorld instance
                this.tick = function () {
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
                        if ((this._minX && this._deltaVector.x < 0 && currentPosition.x <= this._minX) || (this._maxX && this._deltaVector.x > 0 && currentPosition.x >= this._maxX)) {
                            this._deltaVector.x = 0;
                            this._deltaValueLeftAndRight = 0;
                        }

                        // Controlling up & down borders.
                        if ((this._minY && this._deltaVector.y > 0 && currentPosition.y >= this._minY) || (this._maxY && this._deltaVector.y < 0 && currentPosition.y <= this._maxY)) {
                            this._deltaVector.y = 0;
                            this._deltaValueUpAndDown = 0;
                        }

                        // Controlling min Z & max Z borders.
                        if ((this._minZ && this._deltaVector.z < 0 && currentPosition.z <= this._minZ) || (this._maxZ && this._deltaVector.z > 0 && currentPosition.z >= this._maxZ)) {
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
                        } else {
                            this._gameEntityConnected.setPosition(this._gameEntityConnected.getPosition().add(this._deltaVector));
                        }

                        // Adding inertia
                        this._deltaVector = this._deltaVector.scale(0.9);
                        this._deltaValueLeftAndRight *= 0.9;
                        this._deltaValueUpAndDown *= 0.9;
                    }
                };
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
                window.addEventListener("keydown", function (evt) {
                    this._onKeyDown(evt);
                }, false);
                window.addEventListener("keyup", function (evt) {
                    this._onKeyUp(evt);
                }, false);
                window.addEventListener("blur", function () {
                    this._keys = [];
                }, false);
            }
            return KeyboardManager;
        })();
        GameFX.KeyboardManager = KeyboardManager;

        // Mainly based on these 2 articles :
        // Creating an universal virtual touch joystick working for all Touch models thanks to Hand.JS : http://blogs.msdn.com/b/davrous/archive/2013/02/22/creating-an-universal-virtual-touch-joystick-working-for-all-touch-models-thanks-to-hand-js.aspx
        // & on Seb Lee-Delisle original work: http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
        // shim layer with setTimeout fallback
        window.requestAnimationFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        })();

        var VirtualJoystick = (function () {
            function VirtualJoystick(leftJoystick) {
                var _this = this;
                this.setJoystickSensibility = function (newJoystickSensibility) {
                    this._joystickSensibility = newJoystickSensibility;
                    this._inversedSensibility = 1 / (this._joystickSensibility / 1000);
                };
                this.setRotationSpeed = function (newRotationSpeed) {
                    this._rotationSpeed = newRotationSpeed;
                    this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
                };
                this.onPointerDown = function (e) {
                    var newPointer = { identifier: e.pointerId, x: e.clientX, y: e.clientY, type: this.givePointerType(e) };
                    var positionOnScreenCondition;
                    if (this._leftJoystick === true) {
                        positionOnScreenCondition = (e.clientX < this.halfWidth);
                    } else {
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
                    } else {
                        // You can only trigger the action buttons with a joystick declared
                        if (this.globalJoystickIndex < 2 && this._action) {
                            this._action();
                            this._touches.add(e.pointerId, newPointer);
                        }
                    }
                };
                this.onPointerMove = function (e) {
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
                    } else {
                        if (this._touches.item(e.pointerId)) {
                            this._touches.item(e.pointerId).x = e.clientX;
                            this._touches.item(e.pointerId).y = e.clientY;
                        }
                    }
                };
                this.tick = function () {
                    if (this._gameEntityConnected) {
                        var currentPosition = this._gameEntityConnected.getPosition();

                        // Code to block the entity on a virtual 2D screen.
                        // Useful for 2D games (platformer, etc.) or 3D game like shoot'em'up
                        // Controlling left & right borders.
                        if ((this._minX && this._deltaPosition.x < 0 && currentPosition.x <= this._minX) || (this._maxX && this._deltaPosition.x > 0 && currentPosition.x >= this._maxX)) {
                            this._deltaPosition.x = 0;
                        }

                        // Controlling up & down borders.
                        if ((this._minY && this._deltaPosition.y > 0 && currentPosition.y >= this._minY) || (this._maxY && this._deltaPosition.y < 0 && currentPosition.y <= this._maxY)) {
                            this._deltaPosition.y = 0;
                        }

                        // Controlling min Z & max Z borders.
                        if ((this._minZ && this._deltaPosition.z < 0 && currentPosition.z <= this._minZ) || (this._maxZ && this._deltaPosition.z > 0 && currentPosition.z >= this._maxZ)) {
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
                        } else {
                            this._gameEntityConnected.setPosition(this._gameEntityConnected.getPosition().add(this._deltaPosition));
                        }
                    }
                    if (this._cameraConnected) {
                        if (this._leftJoystick === true) {
                            var cameraTransform = BABYLON.Matrix.RotationYawPitchRoll(this._cameraConnected.rotation.y, this._cameraConnected.rotation.x, 0);
                            var deltaTransform = BABYLON.Vector3.TransformCoordinates(this._deltaPosition, cameraTransform);

                            this._cameraConnected.cameraDirection = this._cameraConnected.cameraDirection.add(deltaTransform);
                        } else {
                            this._cameraConnected.cameraRotation = this._cameraConnected.cameraRotation.add(this._deltaPosition);
                        }
                    }
                    if (!this._joystickPressed) {
                        this._deltaPosition = this._deltaPosition.scale(0.9);
                    }
                };
                this.onPointerUp = function (e) {
                    if (this.joystickPointerID == e.pointerId) {
                        this.joystickPointerID = -1;
                        this._joystickPressed = false;
                    }
                    this.deltaJoystickVector.x = 0;
                    this.deltaJoystickVector.y = 0;

                    this._touches.remove(e.pointerId);
                };
                this.setJoystickColor = function (newColor) {
                    this._joystickColor = newColor;
                };
                this.setActionOnTouch = function (action) {
                    this._action = action;
                };
                // Define which axis you'd like to control for left & right keys
                this.setAxisForLR = function (axisLetter) {
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
                this.setAxisForUD = function (axisLetter) {
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
                this.setMinMaxX = function (leftX, rightX) {
                    this._minX = leftX;
                    this._maxX = rightX;
                };
                // Set the up & down borders of the virtual 2D screen to test
                this.setMinMaxY = function (bottomY, topY) {
                    this._minY = bottomY;
                    this._maxY = topY;
                };
                // Set the up & down borders of the virtual 2D screen to test
                this.setMinMaxZ = function (minZ, maxZ) {
                    this._minZ = minZ;
                    this._maxZ = maxZ;
                };
                this.drawVirtualJoystick = function () {
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
                        } else {
                            this._canvasContext.beginPath();
                            this._canvasContext.fillStyle = "white";
                            this._canvasContext.beginPath();
                            this._canvasContext.strokeStyle = "red";
                            this._canvasContext.lineWidth = "6";
                            this._canvasContext.arc(touch.x, touch.y, 40, 0, Math.PI * 2, true);
                            this._canvasContext.stroke();
                        }
                        ;
                    });
                    requestAnimationFrame(function () {
                        this.drawVirtualJoystick();
                    });
                };
                this.givePointerType = function (event) {
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
                this.connectTo = function (entityOrCameraToConnectTo) {
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
                        } else {
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
                this.activateRotationOnAxisRelativeToMesh = function () {
                    this._rotateOnAxisRelativeToMesh = true;

                    // Default control are set to control rotation on Y axis with Left/Right and X axis on Up/Down
                    this.setAxisForLR("Y");
                    this.setAxisForUD("X");
                };
                this.activateMoveOnAxisRelativeToWorld = function () {
                    this._rotateOnAxisRelativeToMesh = false;

                    // Default control are set to control translation on X axis via Left/Right and on Y axis on Up/Down
                    this.setAxisForLR("X");
                    this.setAxisForUD("Y");
                };
                this.globalJoystickIndex = this.globalJoystickIndex || 0;
                if (leftJoystick) {
                    this._leftJoystick = true;
                } else {
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

                this._canvas.addEventListener('pointerdown', function (evt) {
                    return _this.onPointerDown(evt);
                }, false);
                this._canvas.addEventListener('pointermove', function (evt) {
                    return _this.onPointerMove(evt);
                }, false);
                this._canvas.addEventListener('pointerup', function (evt) {
                    return _this.onPointerUp(evt);
                }, false);
                this._canvas.addEventListener('pointerout', function (evt) {
                    return _this.onPointerUp(evt);
                }, false);
                this._canvas.addEventListener("contextmenu", function (e) {
                    return e.preventDefault();
                }, false);
                requestAnimationFrame(function () {
                    return _this.drawVirtualJoystick();
                });
            }
            return VirtualJoystick;
        })();
        GameFX.VirtualJoystick = VirtualJoystick;
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
