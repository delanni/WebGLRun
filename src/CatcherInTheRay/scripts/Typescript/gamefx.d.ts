
declare module BABYLON.GameFX {
        class AssetsManager {
            constructor (scene:any);

            // called by gameEntity to indicate it has finished loading itself
            public static markEntityAsLoaded (indexEntity:any);

            public loadAllEntitiesAsync(sceneReady:boolean);

            // Return a cloned version of a previously loaded entity
            public cloneLoadedEntity(typeEntity:any):any;

            public push(gameEntityToAdd:any);
        }


/*
﻿var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        var Collection = (function () {
            function Collection() {
                this.count = 0;
                this.collection = {};
            }
            Collection.prototype.add = function (key, item) {
                if (this.collection[key] != undefined)
                    return undefined;
                this.collection[key] = item;
                return ++this.count
            }
            Collection.prototype.remove = function (key) {
                if (this.collection[key] == undefined)
                    return undefined;
                delete this.collection[key]
                return --this.count
            }
            Collection.prototype.item = function (key) {
                return this.collection[key];
            }
            Collection.prototype.forEach = function (block) {
                for (key in this.collection) {
                    if (this.collection.hasOwnProperty(key)) {
                        block(this.collection[key]);
                    }
                }
            }
            return Collection;
        })();
        GameFX.Collection = Collection;
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));

﻿var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        // Display HTML elements on top of canvas game
        var Dashboard = (function () {
            var that;
            function Dashboard() {
                that = this;
                this.renderCanvas = document.getElementById("renderCanvas");
                if (this.renderCanvas != null) {
                    this.renderCanvas.style.display = "none";
                }
                this.loadingText = document.getElementById("loadingText");
                if (this.loadingText != null) {
                    this.loadingText.style.webkitTransform = "translateX(0px)";
                    this.loadingText.style.transform = "translateX(0px)";
                }
            }

            Dashboard.prototype.loading = function (evt) {
                if (that.loadingText != null) {
                    that.loadingText.innerHTML = "Loading, please wait..." + (evt.loaded * 100 / evt.total).toFixed() + "%";
                }
                
            };
            
            Dashboard.prototype.endGame = function () {
                if (that.loadingText != null) {
                    that.loadingText.innerHTML = "End Game";
                    that.loadingText.style.webkitTransform = "translateX(0px)";
                    that.loadingText.style.transform = "translateX(0px)";
                }
                if (that.renderCanvas != null) {
                    that.renderCanvas.style.display = "none";
                }
            }


            Dashboard.prototype.endLoading = function () {
                if (that.loadingText != null) {
                    that.loadingText.style.webkitTransform = "";
                    that.loadingText.style.transform = "";
                }
                if (that.renderCanvas != null) {
                    that.renderCanvas.style.display = "block";
                }
            }

            return Dashboard;
        })()
        GameFX.Dashboard = Dashboard;
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
﻿// Used to handle pseudo heritage 
// Approach used in TypeScript generated JS
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        // The base class by all game entities
        var GameEntity = (function () {
            function GameEntity(name, url, fileName, position, gameWorld) {
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
            GameEntity.prototype.setPosition = function (newPosition) {
                if (this._mesh) {
                    this._mesh.position = newPosition;
                }
            };
            GameEntity.prototype.setHasCollisions = function (hasCollision, descendantsCollision) {
                if (hasCollision === true) {
                    this._gameWorld.entitiesRegisterCollision.push(this);
                    this._descendantsCollision = descendantsCollision;
                }
                else {
                    var index = this._gameWorld.entitiesRegisterCollision.indexOf(this);
                    if (index !== -1)
                    {
                        this._gameWorld.entitiesRegisterCollision.splice(index, 1);
                    }
                }
                this._hasCollisions = hasCollision;
            };

            GameEntity.prototype.getGameWorld = function () {
                return this._gameWorld;
            };

            GameEntity.prototype.initialize = function (manual) {
            }

            //Return {value: true / false, tag: object} 
            GameEntity.prototype.intersectBehavior = function () {
                return { value: false, tag: null };
            }

            GameEntity.prototype.collisionBehavior = function (entity, tag) {
                entity.damageBehavior(this._live);
            }

            GameEntity.prototype.damageBehavior = function (live)
            {
                return live;
            }
           
            GameEntity.prototype.getPosition = function () {
                if (this._mesh) {
                    return (this._mesh.position);
                } else {
                    return BABYLON.Vector3.Zero();
                }
            };

            GameEntity.prototype.markForRemove = function() {
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

            return GameEntity;
        })();
        GameFX.GameEntity = GameEntity;
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
﻿/// <reference path="/GameFX/babylon.gamefx.gameentity.js" />

var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        var GameEntity2D = (function (_super) {
            __extends(GameEntity2D, _super);
            function GameEntity2D(name, url, fileName, position, angle, size, gameWorld) {
                _super.call(this, name, url, fileName, position, gameWorld);
                this._angle = angle;
                this._size = size;
            }
            // Code à fixer? gerer un angle en degree sur la propriété y de la rotation
            GameEntity2D.prototype.getAngle = function (newAngle) {
                this._mesh.rotation.z = newAngle;
            };
            GameEntity2D.prototype.setAngle = function () {
                return (this._mesh.rotation.z);
            };
            GameEntity2D.prototype.setSize = function (newSize) {
                this._mesh.scaling.x = newSize;
                this._mesh.scaling.y = newSize;
                this._mesh.scaling.z = newSize;
            };
            GameEntity2D.prototype.getSize = function () {
                return (this._mesh.scaling.x);
            };
            return GameEntity2D;
        })(BABYLON.GameFX.GameEntity);
        GameFX.GameEntity2D = GameEntity2D;
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
﻿/// <reference path="/GameFX/babylon.gamefx.gameentity2D.js" />

var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        var GameEntity3D = (function (_super) {
            __extends(GameEntity3D, _super);
            function GameEntity3D(name, url, fileName, position, rotation, scaling, cloneable, gameWorld) {
                // Call the based constructor (GameEntity here)
                _super.call(this, name, url, fileName, position, gameWorld);
                if (cloneable) {
                    this._cloneable = cloneable;
                } else {
                    this._cloneable = false;
                }
                this._rotation = rotation;
                this._scaling = scaling;
                this._entityDirection = BABYLON.Vector3.Zero();
            }
            GameEntity3D.prototype.setRotation = function (newRotation) {
                this._mesh.rotation = newRotation;
            };
            GameEntity3D.prototype.getRotation = function () {
                return (this._mesh.rotation);
            };
            GameEntity3D.prototype.setScaling = function (newScaling) {
                this._mesh.scaling = newScaling;
            };
            GameEntity3D.prototype.getScaling = function () {
                return (this._mesh.scaling);
            };
            GameEntity3D.prototype.loaded = function (meshes, particleSystems) {
            };

            GameEntity3D.prototype.onDispose = function (thatEntity) {
            };
            GameEntity3D.prototype.moveOnAxisRelativeToMesh = function (moveVector) {
                var entityTransform = BABYLON.Matrix.RotationYawPitchRoll(this._mesh.rotation.y, this._mesh.rotation.x, this._mesh.rotation.z);
                this._entityDirection = BABYLON.Vector3.TransformCoordinates(moveVector, entityTransform);
                this._mesh.position = this._mesh.position.add(this._entityDirection);
            };
            GameEntity3D.prototype.loadMesh = function (scene, callback, indexEntity) {
                var that = this;
                BABYLON.SceneLoader.ImportMesh(this._name, this._url, this._fileName, scene, function(meshes, particleSystems) {
                    that._mesh = meshes[0];
                    that._mesh.scaling = that._scaling;
                    if (that._position)
                        that._mesh.position = that._position;
                    that._mesh.rotation = that._rotation;
                    that._mesh.onDispose = that.onDispose;
                    // if this object will be the based on multiple instance
                    // the main reference won't be enabled. It will only be used to build
                    // clone objects
                    if (that._cloneable)
                        that._mesh.setEnabled(false);

                    for (var index = 0; index < particleSystems.length; index++) {
                        particleSystems[index].minSize *= 0.05;
                        particleSystems[index].maxSize *= 0.05;
                    }
                    that.isReady = true;
                    that.loaded(meshes, particleSystems);
                    that.initialize(false);
                    if (callback)
                        callback(that._mesh, particleSystems);

                    if (indexEntity != undefined) {
                        BABYLON.GameFX.AssetsManager.markEntityAsLoaded(indexEntity);
                    }

                }, that._gameWorld.dashboard.loading);
            };

            GameEntity3D.prototype._internalClone = function () {
                return new GameEntity3D(this._name, this._url, this._fileName, this._position.clone(), this._rotation.clone(), this._scaling.clone(), false, this._gameWorld);
            };
            GameEntity3D.prototype.clone = function () {
                var clonedObject = this._internalClone();
                clonedObject.isReady = true;
                clonedObject._mesh = this._mesh.clone();
                clonedObject._mesh.onDispose = this.onDispose;
                clonedObject._mesh.setEnabled(true);
                clonedObject.initialize(false);
                return clonedObject;
            };
            return GameEntity3D;
        })(BABYLON.GameFX.GameEntity);
        GameFX.GameEntity3D = GameEntity3D;
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
﻿/// <reference path="/GameFX/babylon.gamefx.keyboardmanager.js" />
/// <reference path="/GameFX/babylon.gamefx.virtualjoystick.js" />
/// <reference path="/GameFX/babylon.gamefx.assetsmanager.js" />
/// <reference path="/GameFX/babylon.gamefx.dashboard.js" />
/// <reference path="/GameFX/babylon.gamefx.gameentity3D.js" />
/// <reference path="/GameFX/babylon.gamefx.dashboard.js" />
*/

        class GameWorld = (function () {
            
            constructor(canvasId:string, fullify:string);
            
            function extendCanvas(fullify:string);
            
            function getEntityWithMesh(mesh:BABYLON.Mesh):any;

            GameWorld.prototype.renderLoop = function () {
                this.engine.beginFrame();
                this.scene.render();
                this.engine.endFrame();
                BABYLON.Tools.QueueNewFrame(function () { that.renderLoop(); });
            };
          
            GameWorld.prototype.setCameraToFollowEntity = function (entity, delta) {
                this._entityToFollow = entity;
                this._deltaCameraEntityToFollow = delta;

            };

            GameWorld.prototype.setCameraPosition = function (newCameraPosition) {
                this.camera.position = newCameraPosition;
            };

            GameWorld.prototype.addKeyboard = function () {
                this.Keyboard = new BABYLON.GameFX.KeyboardManager();
                return this.Keyboard;
            };

            GameWorld.prototype.addLeftJoystick = function () {
                this.LeftJoystick = new BABYLON.GameFX.VirtualJoystick(true);
                return this.LeftJoystick;
            };

            GameWorld.prototype.addRightJoystick = function () {
                this.RightJoystick = new BABYLON.GameFX.VirtualJoystick(false);
                return this.RightJoystick;
            };

            // Add a callback function if you'd like to add your own logic on each tick
            GameWorld.prototype.startGameLoop = function (callback) {
                this.scene.beforeRender = function () {
                    if (that.Keyboard) that.Keyboard.tick();
                    if (that.LeftJoystick) that.LeftJoystick.tick();
                    if (that.RightJoystick) that.RightJoystick.tick();
                    that.triggerTicksOnAllEntities();
                    that.collisionLoop();
                    if (callback) callback();
                    
                    //if cameraFollowEntity
                    if (that._entityToFollow != null) {
                        var entityTransform = BABYLON.Matrix.RotationYawPitchRoll(that._entityToFollow._mesh.rotation.y,
                                                                                  that._entityToFollow._mesh.rotation.x,
                                                                                  that._entityToFollow._mesh.rotation.z);
                        var cameraDirection = BABYLON.Vector3.TransformCoordinates(that._deltaCameraEntityToFollow, entityTransform);

                        that.camera.position = that._entityToFollow._mesh.position.add(cameraDirection);
                        that.camera.setTarget(that._entityToFollow._mesh.position);
                    }

                };
            };

            GameWorld.prototype.triggerTicksOnAllEntities = function () {
                for (var i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].tick) {
                        this.entities[i].tick();
                    }
                }
            };

            GameWorld.prototype.collisionLoop = function () {
                var behaviorsCollection = [];

                // First loop is testing all possibles collisions
                // and build a behaviors collisions collections to be called after that
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
                            if(intersectBehavior.value){
                                behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], tag: intersectBehavior.tag });
                            }
                        }
                    }
                }

                // Asking to each entity to apply its collision behavior
                for (var k = 0; k < behaviorsCollection.length; k++) {
                    if ((behaviorsCollection[k].registeredEntity) != null)
                        behaviorsCollection[k].registeredEntity.collisionBehavior(behaviorsCollection[k].targetEntity, behaviorsCollection[k]);
                    if ((behaviorsCollection[k].targetEntity) != null)
                        behaviorsCollection[k].targetEntity.collisionBehavior(behaviorsCollection[k].registeredEntity, behaviorsCollection[k]);
                }

                behaviorsCollection = [];
            };

            GameWorld.prototype.getRay3D = function (x, y) {
                return this.scene.createPickingRay(x, y);
            };

            // If you need to know the max X & Y where your 3D mesh will be visible on screen
            // Use this function passing the current Z level where you entity lives
            // It's useful when you need to "think" in a 2D equivalent
            GameWorld.prototype.getVirtual2DWindowOnZ = function (z) {
                // Getting virtual left top border 
                var rayTop = this.getRay3D(0, 0);
                var rayBottom = this.getRay3D(this.scene.getEngine().getRenderWidth(), this.scene.getEngine().getRenderHeight());

                var top = rayTop.origin.add(rayTop.direction.scale(z));
                var bottom = rayBottom.origin.add(rayBottom.direction.scale(z));

                return { top: top, bottom: bottom };
            };

            return GameWorld;
        })();
        GameFX.GameWorld = GameWorld;
  
    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));﻿var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        var KeyboardManager = (function () {
            function KeyboardManager() {
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
                var that = this;
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
                this._handleKey = [function () { }];

                window.addEventListener("keydown", function (evt) { that._onKeyDown(evt); }, false);
                window.addEventListener("keyup", function (evt) { that._onKeyUp(evt); }, false);
                window.addEventListener("blur", function () { that._keys = []; }, false);
            }

            // if you want to change the mapping for the left, up, right, down 
            // you have to provide the keycode for each arrows key
            // Example: setBasicKeysCodes(81, 90, 68, 83) to map to Q,Z,D,S in AZERTY. 
            KeyboardManager.prototype.setBasicKeysCodes = function (leftCode, upCode, rightCode, downCode) {
                this._leftKeyCode = leftCode;
                this._upKeyCode = upCode;
                this._rightKeyCode = rightCode;
                this._downKeyCode = downCode;
            };

            // Set the left & right borders of the virtual 2D screen to test
            KeyboardManager.prototype.setMinMaxX = function (leftX, rightX) {
                this._minX = leftX;
                this._maxX = rightX;
            };

            // Set the up & down borders of the virtual 2D screen to test
            KeyboardManager.prototype.setMinMaxY = function (bottomY, topY) {
                this._minY = bottomY;
                this._maxY = topY;
            };

            // Set the up & down borders of the virtual 2D screen to test
            KeyboardManager.prototype.setMinMaxZ = function (minZ, maxZ) {
                this._minZ = minZ;
                this._maxZ = maxZ;
            };

            // Define which axis you'd like to control for left & right keys
            KeyboardManager.prototype.setAxisForLR = function (axisLetter) {
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
            KeyboardManager.prototype.setAxisForUD = function (axisLetter) {
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
            KeyboardManager.prototype.setDeltaValue = function (value) {
                this._deltaValue = value;
            };

            // Call this function to connect the game entity you'd like to move with the keyboard
            KeyboardManager.prototype.connectTo = function (entityOrCameraToConnectTo) {
                if (entityOrCameraToConnectTo instanceof BABYLON.GameFX.GameEntity) {
                    this._gameEntityConnected = entityOrCameraToConnectTo;
                }
                if (entityOrCameraToConnectTo instanceof BABYLON.FreeCamera) {
                    this._cameraConnected = entityOrCameraToConnectTo;
                    entityOrCameraToConnectTo.checkCollisions = true;
                }
            };

            KeyboardManager.prototype.activateRotationOnAxisRelativeToMesh = function () {
                this._rotateOnAxisRelativeToMesh = true;
                // Default control are set to control rotation on Y axis with Left/Right and X axis on Up/Down
                this.setAxisForLR("Y");
                this.setAxisForUD("X");
            };

            KeyboardManager.prototype.activateMoveOnAxisRelativeToWorld = function () {
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
            // will move the entity first using the embedded logic and will call handleLeft() function after that
            KeyboardManager.prototype.setKeysBehaviors = function (behaviors) {
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

            // Called to add a new behavior that will be called after the default one set by the constructor
            KeyboardManager.prototype.addBehavior = function (behaviorToAdd, currentBehavior) {
                var originalBehavior = currentBehavior;
                var additionnalBehavior = behaviorToAdd;
                var that = this;
                return function () {
                    originalBehavior.call(that);
                    additionnalBehavior();
                }
            };

            KeyboardManager.prototype._onKeyDown = function (evt) {
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

            KeyboardManager.prototype._onKeyUp = function (evt) {
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

            KeyboardManager.prototype.setRotationSpeed = function (newRotationSpeed) {
                this._rotationSpeed = newRotationSpeed;
                this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
            };

            // Tick function that will be called by the hidden animation loop
            // of the GameWorld instance
            KeyboardManager.prototype.tick = function () {
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
            return KeyboardManager;
        })();
        GameFX.KeyboardManager = KeyboardManager;

    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
﻿/// <reference path="/GameFX/babylon.gamefx.collection.js" />

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

var BABYLON;
(function (BABYLON) {
    (function (GameFX) {
        var VirtualJoystick = (function () {
            var _canvas;
            var _canvasContext;
            var globalJoystickIndex = 0;

            function VirtualJoystick(leftJoystick) {
                if (leftJoystick)
                {
                    this._leftJoystick = true;
                }
                else {
                    this._leftJoystick = false;
                }

                this.joystickIndex = globalJoystickIndex;
                globalJoystickIndex++;

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
                if (!_canvas) {
        		    _canvas = document.createElement("canvas");
        		    this._canvasWidth = window.innerWidth;
        		    this._canvasHeight = window.innerHeight;
        		    _canvas.width = window.innerWidth;
        		    _canvas.height = window.innerHeight;
        		    _canvas.style.width = "100%";
        		    _canvas.style.height = "100%";
        		    _canvas.style.position = "absolute";
        		    _canvas.style.backgroundColor = "transparent";
        		    _canvas.style.top = "0px";
        		    _canvas.style.left = "0px";
        		    _canvas.style.zIndex = 10;
        		    _canvas.style.msTouchAction = "none";
        		    _canvasContext = _canvas.getContext('2d');
        		    _canvasContext.strokeStyle = "#ffffff";
        		    _canvasContext.lineWidth = 2;
        		    document.body.appendChild(_canvas);
                }
        		this.halfWidth = _canvas.width / 2;
        		this.halfHeight = _canvas.height / 2;
        		this._joystickPressed = false;
                // default joystick color
        		this._joystickColor = "cyan";

        		this.joystickPointerID = -1;
                // current joystick position
        		this.joystickPointerPos = new BABYLON.Vector2(0, 0);
                // origin joystick position
        		this.joystickPointerStartPos = new BABYLON.Vector2(0, 0);
        		this.deltaJoystickVector = new BABYLON.Vector2(0, 0);

        		var that = this;
        		_canvas.addEventListener('pointerdown', function (evt) {
        			that.onPointerDown(evt);
        		}, false);
        		_canvas.addEventListener('pointermove', function (evt) {
        			that.onPointerMove(evt);
        		}, false);
        		_canvas.addEventListener('pointerup', function (evt) {
        			that.onPointerUp(evt);
        		}, false);
        		_canvas.addEventListener('pointerout', function (evt) {
        			that.onPointerUp(evt);
                }, false);
        		_canvas.addEventListener("contextmenu", function (e) {
        		    e.preventDefault();    // Disables system menu
        		}, false);
        		requestAnimationFrame(function () {
        			that.drawVirtualJoystick();
        		});
        	}

            VirtualJoystick.prototype.setJoystickSensibility = function (newJoystickSensibility) {
                this._joystickSensibility = newJoystickSensibility;
                this._inversedSensibility = 1 / (this._joystickSensibility / 1000);
            };

            VirtualJoystick.prototype.setRotationSpeed = function (newRotationSpeed) {
                this._rotationSpeed = newRotationSpeed;
                this._inverseRotationSpeed = 1 / (this._rotationSpeed / 1000);
            };

            VirtualJoystick.prototype.onPointerDown = function (e) {
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
                    if (globalJoystickIndex < 2 && this._action) {
                        this._action();
                        this._touches.add(e.pointerId, newPointer);
                    }
                }
            };

            VirtualJoystick.prototype.onPointerMove = function (e) {
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

        	VirtualJoystick.prototype.tick = function () {
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

        	VirtualJoystick.prototype.onPointerUp = function (e) {
        		if (this.joystickPointerID == e.pointerId) {
        		    this.joystickPointerID = -1;
        		    this._joystickPressed = false;
        		}
        		this.deltaJoystickVector.x = 0;
        		this.deltaJoystickVector.y = 0;

        		this._touches.remove(e.pointerId);
        	};

        	VirtualJoystick.prototype.setJoystickColor = function (newColor) {
        	    this._joystickColor = newColor;
        	};

        	VirtualJoystick.prototype.setActionOnTouch = function (action) {
        	    this._action = action;
        	};

            // Define which axis you'd like to control for left & right keys
        	VirtualJoystick.prototype.setAxisForLR = function (axisLetter) {
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
        	VirtualJoystick.prototype.setAxisForUD = function (axisLetter) {
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
        	VirtualJoystick.prototype.setMinMaxX = function (leftX, rightX) {
        	    this._minX = leftX;
        	    this._maxX = rightX;
        	};

            // Set the up & down borders of the virtual 2D screen to test
        	VirtualJoystick.prototype.setMinMaxY = function (bottomY, topY) {
        	    this._minY = bottomY;
        	    this._maxY = topY;
        	};

            // Set the up & down borders of the virtual 2D screen to test
        	VirtualJoystick.prototype.setMinMaxZ = function (minZ, maxZ) {
        	    this._minZ = minZ;
        	    this._maxZ = maxZ;
        	};

        	VirtualJoystick.prototype.drawVirtualJoystick = function () {
        		_canvasContext.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        		var that = this;
        		this._touches.forEach(function (touch) {
        		    if (touch.identifier === that.joystickPointerID) {
        		        _canvasContext.beginPath();
        		        _canvasContext.strokeStyle = that._joystickColor;
        		        _canvasContext.lineWidth = 6;
        		        _canvasContext.arc(that.joystickPointerStartPos.x, that.joystickPointerStartPos.y, 40, 0, Math.PI * 2, true);
        		        _canvasContext.stroke();
        		        _canvasContext.beginPath();
        		        _canvasContext.strokeStyle = that._joystickColor;
        		        _canvasContext.lineWidth = 2;
        		        _canvasContext.arc(that.joystickPointerStartPos.x, that.joystickPointerStartPos.y, 60, 0, Math.PI * 2, true);
        		        _canvasContext.stroke();
        		        _canvasContext.beginPath();
        		        _canvasContext.strokeStyle = that._joystickColor;
        		        _canvasContext.arc(that.joystickPointerPos.x, that.joystickPointerPos.y, 40, 0, Math.PI * 2, true);
        		        _canvasContext.stroke();
        		    }
        		    else {
        		        _canvasContext.beginPath();
        		        _canvasContext.fillStyle = "white";
        		        _canvasContext.beginPath();
        		        _canvasContext.strokeStyle = "red";
        		        _canvasContext.lineWidth = "6";
        		        _canvasContext.arc(touch.x, touch.y, 40, 0, Math.PI * 2, true);
        		        _canvasContext.stroke();
        		    };
        		});
        		requestAnimationFrame(function () {
        			that.drawVirtualJoystick();
        		});
        	};

        	VirtualJoystick.prototype.givePointerType = function (event) {
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

        	VirtualJoystick.prototype.connectTo = function (entityOrCameraToConnectTo) {
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

        	VirtualJoystick.prototype.activateRotationOnAxisRelativeToMesh = function () {
        	    this._rotateOnAxisRelativeToMesh = true;
        	    // Default control are set to control rotation on Y axis with Left/Right and X axis on Up/Down
        	    this.setAxisForLR("Y");
        	    this.setAxisForUD("X");
        	};

        	VirtualJoystick.prototype.activateMoveOnAxisRelativeToWorld = function () {
        	    this._rotateOnAxisRelativeToMesh = false;
        	    // Default control are set to control translation on X axis via Left/Right and on Y axis on Up/Down
        	    this.setAxisForLR("X");
        	    this.setAxisForUD("Y");
        	};

            return VirtualJoystick;
        })();
        GameFX.VirtualJoystick = VirtualJoystick;

    })(BABYLON.GameFX || (BABYLON.GameFX = {}));
    var GameFX = BABYLON.GameFX;
})(BABYLON || (BABYLON = {}));
*/