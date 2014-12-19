module GAME {
    export module SCENES {

        export interface GameParameters {
            character: string;
            name: string;
            isHost?: boolean;
            debug?: boolean;
            useFlatShading?: boolean;
        }

        export class GameScene extends SceneBuilder {
            private _randomSeed: number;
            private _debug: boolean;
            private _useFlatShading: boolean;
            private _mapParams: TERRAIN.TerrainGeneratorParams;
            private _character: string;
            private _flatShaderMat: BABYLON.ShaderMaterial;
            private _weirdShaderMat: BABYLON.ShaderMaterial;
            private _followPlayer: boolean;
            private _shadowGenerator: BABYLON.ShadowGenerator;

            mainCamera: BABYLON.FollowCamera;
            startOrb: BABYLON.Mesh;
            endOrb: BABYLON.Mesh;
            mountains: BABYLON.Mesh;
            collectibles: BABYLON.Mesh[] = [];
            player: GAME.Player;
            enemy: GAME.Player;

            constructor(gameWorld: GAME.GameWorld, parameters: GameParameters, mapParameters: TERRAIN.TerrainGeneratorParams) {
                super(gameWorld);

                this._debug = parameters.debug || false;
                this._useFlatShading = parameters.useFlatShading || false;
                this._character = parameters.character;
                this._mapParams = mapParameters;
                this._randomSeed = mapParameters.randomSeed;

                this._followPlayer = true;
            }

            private addLightsAndCamera(): void {
                var scene = this._scene;

                // Adding light
                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;

                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;

                this.mainCamera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 1000, 0), scene);
                this.mainCamera.maxZ = 10000;
                this.mainCamera.speed = 8;
            }

            private addSkyDome(): void {
                var scene = this._scene;

                // Skybox
                var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
                skybox.rotation.y = 1.2;
                var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
                skyboxMaterial.backFaceCulling = false;
                skybox.material = skyboxMaterial;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.reflectionTexture = Cast<BABYLON.Texture>(new BABYLON.CubeTexture(
                    "/assets/Skybox/skyrender", scene,
                    //  +x          +y          +z          -x          -y          -z
                    ["0006.png", "0002.png", "0001.png", "0003.png", "0005.png", "0004.png"]));
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skybox.checkCollisions = false;
            }

            private generateLandscape(): void {
                var scene = this._scene;

                // Landscape generation
                var heightMapGenerator = new TERRAIN.HeightMapGenerator(this._mapParams);
                var noise = heightMapGenerator.GenerateHeightMap();

                // Terrain from the heightmap
                var terrainGenerator = new TERRAIN.TerrainGenerator(this._mapParams);
                Trace("Mesh from height map");
                var mountainMesh = terrainGenerator.ConvertNoiseToBabylonMesh(noise, scene);
                mountainMesh.name = "MountainMesh";
                Trace("Mesh from height map");

                // Generate wrapping mesh to hide sides
                Trace("Generating sides");
                var wrappingMesh = terrainGenerator.GenerateWrappingMesh(mountainMesh, scene);
                Trace("Generating sides");

                // Colors to mesh
                Trace("Colorize mesh");
                terrainGenerator.ColorizeMesh(mountainMesh);
                Trace("Colorize mesh");

                if (this._useFlatShading) {
                    // Apply flat shading
                    mountainMesh.material = this._flatShaderMat;
                } else {
                    // Apply gouraud shading material
                    var mountainMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                    mountainMesh.material = mountainMaterial;
                    mountainMaterial.specularPower = 0;
                    mountainMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                }

                // Set up miscellanius stuff
                //mountainMesh.receiveShadows = true;
                mountainMesh.checkCollisions = true;
                mountainMesh.subdivide(Cast<BABYLON.GroundMesh>(mountainMesh).subdivisions);
                mountainMesh.createOrUpdateSubmeshesOctree();

                this.mountains = mountainMesh;

                // Set up wrapper's mesh
                var mountainSideMaterial = new BABYLON.StandardMaterial("mountainSideMaterial", scene);
                wrappingMesh.material = mountainSideMaterial;
                mountainSideMaterial.specularPower = 0;
                mountainSideMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                mountainSideMaterial.diffuseColor = new BABYLON.Color3(0.43, 0.29, 0.03);
                // source: https://elliptic-games.com/images/Milestone1-2.jpg
                mountainSideMaterial.bumpTexture = new BABYLON.Texture("/assets/noisenormals.jpg", scene);
            }

            private putStartAndEnd() {
                var scene = this._scene;

                // Put start and end
                this.startOrb = BABYLON.Mesh.CreateSphere("startOrb", 30, 30, scene, true);
                this.startOrb.material = new BABYLON.StandardMaterial("startOrbMat", scene);
                Cast<BABYLON.StandardMaterial>(this.startOrb.material).emissiveColor = new BABYLON.Color3(0.3, 1.0, 0.2);
                this.startOrb.position = new BABYLON.Vector3(this._mapParams.pathTopOffset - this._mapParams.width / 2, 60, this._mapParams.height / 2 - 10);

                this.endOrb = BABYLON.Mesh.CreateSphere("endOrb", 30, 30, scene, true);
                this.endOrb.position = new BABYLON.Vector3(this._mapParams.pathBottomOffset - this._mapParams.width / 2, 20, this._mapParams.height / -2 - 10);
                this.endOrb.material = this._weirdShaderMat;
                this.collectibles.push(this.endOrb);

                scene.registerBeforeRender(() => {
                    var time = (Date.now() / 6666 % 2 * Math.PI);
                    this.endOrb.scaling.x = 1 + Math.sin(time) / 4;
                    this.endOrb.scaling.y = 1 + Math.cos(time + 0.33) / 4;
                    this.endOrb.scaling.z = 1 + Math.sin(time + 0.7) / 4;
                });
            }

            public CreatePlayer(meshName: string): Player {
                var scene = this._scene;
                var playerMesh: BABYLON.Mesh;
                this.player = new Player(scene, this.mountains);

                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, x=> {
                    playerMesh = Cast<BABYLON.Mesh>(x[0]);
                    playerMesh.material = this._flatShaderMat;
                    playerMesh.position = new BABYLON.Vector3(0, -5, 0);
                    playerMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    playerMesh.parent = parent;
                    parent.position = this.startOrb.position.clone();
                    parent.position.x += this._gameWorld.parameters.gameParameters.isHost ? 20 : -20;

                    var cameraFollowTarget = BABYLON.Mesh.CreateSphere("fakeKid", 30, 2, scene, false);
                    cameraFollowTarget.material = new BABYLON.StandardMaterial("fakeMat", scene);
                    cameraFollowTarget.isVisible = false;
                    cameraFollowTarget.position = parent.position.clone();

                    this.player.Initialize(playerMesh);

                    scene.registerBeforeRender(() => {
                        if (this._followPlayer && !this.mainCamera.target) {
                            this.mainCamera.radius = 150; // how far from the object to follow
                            this.mainCamera.heightOffset = 30; // how high above the object to place the camera
                            this.mainCamera.rotationOffset = 0; // the viewing angle
                            this.mainCamera.cameraAcceleration = 0.05; // how fast to move
                            this.mainCamera.maxCameraSpeed = 4; // speed limit
                            this.mainCamera.target = cameraFollowTarget;
                            this.mainCamera.setTarget(cameraFollowTarget.position);
                        } else if (this.mainCamera.target) {
                            var moveTarget = parent.position.subtract(cameraFollowTarget.position);
                            moveTarget.scaleInPlace(0.15);
                            cameraFollowTarget.position.addInPlace(moveTarget);
                            this.mainCamera.rotationOffset = UTILS.Clamp((this.player.CurrentRotation % Math.PI) / Math.PI * 180, -45, 45);
                        }
                    });
                }, null, () => { console.error("Mesh loading error") });

                return this.player;
            }

            public CreateEnemy(meshName: string): Player {
                var scene = this._scene;
                var enemyMesh: BABYLON.Mesh;

                this.enemy = new Player(scene, this.mountains);

                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, x=> {
                    enemyMesh = Cast<BABYLON.Mesh>(x[0]);
                    enemyMesh.material = this._flatShaderMat;
                    enemyMesh.position = new BABYLON.Vector3(0, -5, 0);
                    enemyMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    enemyMesh.parent = parent;
                    parent.position = this.startOrb.position.clone();
                    parent.position.x += this._gameWorld.parameters.gameParameters.isHost ? -20 : 20;

                    this.enemy.Initialize(enemyMesh);

                }, null, () => { console.error("Mesh loading error") });

                return this.enemy;
            }

            private createShaders(): void {
                var scene = this._scene;

                var flatShader = new BABYLON.ShaderMaterial("flatShader", scene, "flat", {
                    attributes: ["position", "normal", "uv", "color"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                });

                var camera = scene.activeCamera;
                flatShader.setVector3("cameraPosition", camera.position);

                for (var i = 0; i < scene.lights.length; i++) {
                    var light = Cast<BABYLON.PointLight>(scene.lights[i]);
                    if (!(light instanceof BABYLON.PointLight)) continue;
                    flatShader.setVector3("light" + (i + 1) + "Position", light.position);
                    var colors = BABYLON.Vector3.FromArray(light.diffuse.asArray());
                    flatShader.setVector3("light" + (i + 1) + "Color", colors);
                }

                // todo: look into soft shadows?

                this._flatShaderMat = flatShader;

                var weirdShader = new BABYLON.ShaderMaterial("weirdShader", scene, "weird", {
                    attributes: ["position", "normal"],
                    uniforms: ["world", "worldView", "worldViewProjection"]
                });

                scene.registerBeforeRender(() => {
                    weirdShader.setFloat("time", (Date.now() / 1000) % (Math.PI * 2));
                });

                this._weirdShaderMat = weirdShader;
            }

            private dropCollectibles(): void {
                console.log("Making collectibles with ", this._randomSeed);
                var randomizer = new MersenneTwister(this._randomSeed);
                var r = 0;
                var testRay = new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Axis.Y.scale(-1));
                for (var i = 0; i < 50;) {
                    var x = (randomizer.Random() * this._mapParams.width - this._mapParams.width / 2) * 0.9;
                    var z = (randomizer.Random() * this._mapParams.height - this._mapParams.height / 2) * 0.9;
                    testRay.origin.x = x;
                    testRay.origin.z = z;
                    var intersex = this.mountains.intersects(testRay, false);
                    if (intersex.hit && intersex.pickedPoint.y < 15) {
                        switch (Math.floor(Math.random() * 3)) {
                            case 0:
                                var collectible = BABYLON.Mesh.CreateSphere("collectible" + i, 20, 10, this._scene, false);
                                break;
                            case 1:
                                collectible = BABYLON.Mesh.CreateTorus("collectible" + i, 5, 2, 60, this._scene, false);
                                break;
                            case 2:
                                collectible = BABYLON.Mesh.CreateTorusKnot("collectible" + i, 2, 1, 80, 30, 3, 4, this._scene, false);
                                break;
                        }
                        collectible.position = intersex.pickedPoint.clone();
                        collectible.position.y += randomizer.Random() * 15 + 10;
                        var axis = new BABYLON.Vector3(Math.random(), Math.random(), Math.random());
                        axis.normalize();
                        collectible.rotate(axis, Math.random() * Math.PI, BABYLON.Space.LOCAL);
                        collectible.material = this._weirdShaderMat;
                        this.collectibles.push(collectible);
                        i++;
                    }
                }
                this._scene.registerBeforeRender(() => {
                    this.collectibles.forEach(e=> e.rotate(BABYLON.Axis.Z, 0.02, BABYLON.Space.LOCAL));
                });
            }

            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene {

                this.addLightsAndCamera();

                this.createShaders();

                this.addSkyDome();

                this.generateLandscape();

                this.putStartAndEnd();

                this.CreatePlayer(this._character);

                this.dropCollectibles();

                return scene;
            }

        }
    }
}