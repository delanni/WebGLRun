/// <reference path="references.ts" />
define(["require", "exports"], function(require, exports) {
    var GAME;
    (function (GAME) {
        var GameWorld = (function () {
            function GameWorld() {
                this._canvas = Cast(document.getElementById(canvasId));
                this._engine = new BABYLON.Engine(this._canvas);
                this._scene = new BABYLON.Scene(this._engine);

                this.camera.attachControl(this.canvas);
            }
            GameWorld.prototype.init = function () {
                this.startGameLoop(this.animate);
            };
            return GameWorld;
        })();
        GAME.GameWorld = GameWorld;
    })(GAME || (GAME = {}));

    var GameWorld = (function () {
        //assetsManager: AssetsManager;
        //dashboard: Dashboard;
        //entities: GameEntity[];
        //entitiesRegisterCollision: GameEntity[];
        //_entityToFollow: GameEntity;
        //_deltaCameraEntityToFollow: any;
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
    exports.GameWorld = GameWorld;
});
