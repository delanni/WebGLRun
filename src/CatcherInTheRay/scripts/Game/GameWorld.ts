module GAME {
    export class GameWorld {
        _engine: BABYLON.Engine;
        _scene: BABYLON.Scene;
        _camera: BABYLON.Camera;
        _canvas: HTMLCanvasElement;
        _gui: GUI;
        _lights: BABYLON.Light[];

        _scenes: { [name: string]: SCENES.SceneBuilder } = {};

        /// DEFAULTS ARE HERE ///
        _defaults: GameProperties = {
            _sceneId: GAME.Scenes.GAME,
            _gameParameters: {
                randomSeed: 345,
                useFlatShading: false
            },
            _mapParameters: {
                destructionLevel: 13,
                displayCanvas: false,
                height: 1500,
                width: 800,
                minHeight: 0,
                maxHeight: 300,
                subdivisions: 180,
                param: 1.1,
                random: new MersenneTwister(12345),
                pathBottomOffset: 80,
                pathTopOffset: 720,
                shrink: 1,
                eqFactor: 1
            }
        };

        constructor(canvasId: string, fullify?: string) {
            this._canvas = Cast<HTMLCanvasElement>(document.getElementById(canvasId));
            this._engine = new BABYLON.Engine(this._canvas);
            this._scene = new BABYLON.Scene(this._engine);
            this._camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), this._scene);
            this._camera.attachControl(this._canvas);


            if (fullify) {
                this.extendCanvas(FullifyStates.HARD);
            }

            this._gui = new GUI(this);

            this.buildScenes(this._defaults);

            BABYLON.Tools.QueueNewFrame(() => this.renderLoop());
        }

        applyGuiParams(guiParams: GameProperties) {
            this.buildScenes(guiParams);
        }

        buildScenes(parameters: GameProperties) {
            var testScene = new SCENES.TestScene(this);
            this._scenes["TEST"] = testScene;

            var gameScene = new SCENES.GameScene(this, parameters._gameParameters, parameters._mapParameters);
            this._scenes["GAME"] = gameScene;
        }

        extendCanvas(fullify: FullifyStates) {
            var parent = this._canvas.parentElement;
            if (fullify == FullifyStates.NO) return;

            var resize = () => {
                if (fullify === FullifyStates.HARD) {
                    this._canvas.width = this._canvas.parentElement.clientWidth;
                    this._canvas.height = this._canvas.parentElement.clientHeight;
                    this._engine.resize();
                } else {
                    this._canvas.style["width"] = "100%";
                    this._canvas.style["height"] = "100%";
                }
            };

            window.onresize = resize;
            resize();
        }

        gameLoop() {
            this.triggerTicksOnAllEntities();
            this.collisionLoop();
        }

        renderLoop() {
            this._engine.beginFrame();
            this._scene.render();
            this._engine.endFrame();
            BABYLON.Tools.QueueNewFrame(() => this.renderLoop());
        }

        triggerTicksOnAllEntities() {
            //for (var i = 0; i < this.entities.length; i++) {
            //    if (this.entities[i].tick) {
            //        this.entities[i].tick();
            //    }
            //}
        }

        collisionLoop() {
            var behaviorsCollection = [];

            // First loop is testing all possibles collisions
            // and build a behaviors collisions collections to be called after this
            //for (var i = 0; i < this.entitiesRegisterCollision.length; i++) {
            //    for (var j = 0; j < this.entities.length; j++) {
            //        if ((this.entities[j]._hasCollisions) && (this.entities[j] != this.entitiesRegisterCollision[i])) {
            //            // Pure intersection on 3D Meshes
            //            if (this.entitiesRegisterCollision[i]._mesh.intersectsMesh(this.entities[j]._mesh, false)) {
            //                behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j] });
            //            }

            //            // Extends 3D collision with a custom behavior (used for particules emitted for instance) 
            //            if (this.entitiesRegisterCollision[i]._descendantsCollision) {
            //                var descendants = this.entitiesRegisterCollision[i]._mesh.getDescendants();
            //                for (var k = 0; k < descendants.length; k++) {
            //                    if (descendants[k].intersectsMesh(this.entities[j]._mesh, false)) {
            //                        behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], descendants: descendants[k] });
            //                    }
            //                }
            //            }

            //            //Intersects Behaviors
            //            var intersectBehavior = this.entitiesRegisterCollision[i].intersectBehavior(this.entities[j]);
            //            if (intersectBehavior.value) {
            //                behaviorsCollection.push({ registeredEntity: this.entitiesRegisterCollision[i], targetEntity: this.entities[j], tag: intersectBehavior.tag });
            //            }
            //        }
            //    }
            //}

            //// Asking to each entity to apply its collision behavior
            //for (var k = 0; k < behaviorsCollection.length; k++) {
            //    if ((behaviorsCollection[k].registeredEntity) != null)
            //        behaviorsCollection[k].registeredEntity.collisionBehavior(behaviorsCollection[k].targetEntity, behaviorsCollection[k]);
            //    if ((behaviorsCollection[k].targetEntity) != null)
            //        behaviorsCollection[k].targetEntity.collisionBehavior(behaviorsCollection[k].registeredEntity, behaviorsCollection[k]);
            //}

            //behaviorsCollection = [];
        }

        loadScene(s: Scenes) {
            var debugItems = document.getElementsByClassName("DEBUG");
            for (var i = 0; debugItems.length>0;) {
                debugItems[i].parentNode.removeChild(debugItems[i]);
            }

            switch (s) {
                case Scenes.TEST:
                    this._scene = this._scenes["TEST"].BuildScene();
                    break;
                case Scenes.GAME:
                    this._scene = this._scenes["GAME"].BuildScene();
                    break;
            }

            this._scene.registerBeforeRender(() => {
                this.gameLoop();
            });
        }
    }

    export enum FullifyStates {
        NO,
        SOFT,
        HARD
    }

    export enum Scenes {
        TEST = 0,
        MAIN = 1,
        GAME = 2
    };
}