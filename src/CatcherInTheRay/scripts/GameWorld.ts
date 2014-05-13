/// <reference path="references.ts" />

module GAME {
    export class GameWorld {
        _engine: BABYLON.Engine;
        _scene: BABYLON.Scene;
        _camera: BABYLON.Camera;
        _canvas: HTMLCanvasElement;
        _lights: BABYLON.Light[];

        constructor(canvasId: string, fullify?: string) {
            this._canvas = Cast<HTMLCanvasElement>(document.getElementById(canvasId));
            this._engine = new BABYLON.Engine(this._canvas);
            this._scene = new BABYLON.Scene(this._engine);
            this._camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), this._scene);
            this._camera.attachControl(this._canvas);


            if (fullify) {
                this.extendCanvas(FullifyStates.HARD);
            }

            this.loadScene(Scenes.GAME);

            BABYLON.Tools.QueueNewFrame(() => this.renderLoop());
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
            var animate: () => void;

            var animate: () => void;

            var buildTestScene = () => {
                var torusKnot: BABYLON.Mesh;

                this._scene = new BABYLON.Scene(this._engine);

                this._lights = [];
                this._lights.push(new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 10, 0), this._scene));

                this._camera = new BABYLON.ArcRotateCamera("Camera", 10, 20, 30, new BABYLON.Vector3(0, 0, 0), this._scene);
                this._camera.attachControl(this._canvas);

                torusKnot = BABYLON.Mesh.CreateTorusKnot("torusknot", 3, 2, 80, 30, 4, 4, this._scene, true);
                animate = () => {
                    torusKnot.rotate(BABYLON.Vector3.Up(), 0.01, BABYLON.Space.LOCAL);
                }
            }

            var buildGameScene = () => {
                var draftCanvas = CreateCanvas(800, 1200, true);
                var pathCanvas = CreateCanvas(800, 1200, true);
                var secondaryNoiseCanvas = CreateCanvas(400, 600, true);

                var bleedBlurPass1 = new FILTERS.BleedFeed(pathCanvas, 30, 6, true);
                var bleedBlurPass2 = new FILTERS.BleedFeed(pathCanvas, 8, 3, true);
                var smallBlurFilter = new FILTERS.StackBlurFilter(12);
                var darkenPathFilter = new FILTERS.DarknessCopyFilter(pathCanvas);

                this._lights = [];
                this._lights.push(new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 500, 0), this._scene));

                animate = () => { }

                var mersenne = new MersenneTwister(1212);

                var noiseGen = new PerlinNoiseGenerator({
                    canvas: draftCanvas,
                    displayCanvas: true,
                    height: 1200,
                    width: 800,
                    random: mersenne,
                    param: 1.1
                });

                var pathGen = new PathGenerator(1515);
                pathGen.MakePath(pathCanvas, 80, pathCanvas.width - 80);
                bleedBlurPass1.Apply(pathCanvas);
                bleedBlurPass2.Apply(pathCanvas);
                //smallBlurFilter.Apply(pathCanvas);


                secondaryNoiseCanvas.getContext("2d").save();
                for (var i = 0; i < 5; i++) {
                    pathGen.MakePath(
                        secondaryNoiseCanvas,
                        (mersenne.Random() * secondaryNoiseCanvas.width) | 0,
                        (mersenne.Random() * secondaryNoiseCanvas.width) | 0,
                        i == 0
                        );
                    secondaryNoiseCanvas.getContext("2d").translate(secondaryNoiseCanvas.width / 2, secondaryNoiseCanvas.height / 2);
                    secondaryNoiseCanvas.getContext("2d").rotate(Math.random() * 180);
                    secondaryNoiseCanvas.getContext("2d").translate(-secondaryNoiseCanvas.width / 2, -secondaryNoiseCanvas.height / 2);
                }
                secondaryNoiseCanvas.getContext("2d").restore();
                bleedBlurPass1.Apply(secondaryNoiseCanvas);
                smallBlurFilter.Apply(secondaryNoiseCanvas);

                var randomStridesFilter = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(secondaryNoiseCanvas, 800,1200));

                var terrainGen = new TerrainGenerator({
                    canvas: draftCanvas,
                    generator: noiseGen,
                    height: 1200,
                    width: 800,
                    minHeight: 0,
                    maxHeight: 400,
                    submesh: 100,
                    displayCanvas: true,
                    filter: [randomStridesFilter, darkenPathFilter, smallBlurFilter]
                });

                var noise = terrainGen.Generate();

                var terrainMesh = terrainGen.NoiseToBabylonMesh(noise, this._scene);

                var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this._scene);
                terrainMesh.material = groundMaterial;

                groundMaterial.ambientColor = BABYLON.Color3.FromInts(3, 35, 8);
                groundMaterial.diffuseColor = BABYLON.Color3.FromInts(0, 200, 39);
                groundMaterial.specularPower = 0;
                groundMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
            }

            switch (s) {
                case Scenes.TEST:
                    buildTestScene();
                    break;
                case Scenes.GAME:
                    buildGameScene();
                    break;
            }

            this._scene.beforeRender = () => {
                animate();
                this.gameLoop();
            };
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