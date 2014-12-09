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
            _randomSeed: number;
            _debug: boolean;
            _useFlatShading: boolean;
            _mapParams: TERRAIN.TerrainGeneratorParams;
            _physicsEngine: BABYLON.OimoJSPlugin;
            _character: string;
            _flatShader: BABYLON.ShaderMaterial;

            mainCamera: BABYLON.FollowCamera;
            followPlayer: boolean;

            startOrb: BABYLON.Mesh;
            endOrb: BABYLON.Mesh;
            mountains: BABYLON.Mesh;

            player: GAME.Player;
            enemy: GAME.Player;

            constructor(gameWorld: GAME.GameWorld, parameters: GameParameters, mapParameters: TERRAIN.TerrainGeneratorParams) {
                this._debug = parameters.debug || false;
                this._useFlatShading = parameters.useFlatShading || false;
                this._character = parameters.character;
                this._mapParams = mapParameters;

                this.followPlayer = true;

                super(gameWorld);
            }

            private addLightsAndCamera(): void {
                var scene = this._scene;

                // Adding light
                this._gameWorld._lights = [];
                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;

                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;
                this._gameWorld._lights.push(antiLight);

                this._gameWorld._lights.push(light);

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

                // Heightmap to mesh
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
                    mountainMesh.material = this._flatShader;
                } else {
                    var mountainMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                    mountainMesh.material = mountainMaterial;
                    mountainMaterial.specularPower = 0;
                    mountainMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                }
                mountainMesh.checkCollisions = true;
                mountainMesh.subdivide(Cast<BABYLON.GroundMesh>(mountainMesh).subdivisions);
                mountainMesh.createOrUpdateSubmeshesOctree();

                this.mountains = mountainMesh;
                this.mountains.material.wireframe = false;

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
                this.endOrb = BABYLON.Mesh.CreateSphere("endOrb", 30, 30, scene, true);
                this.endOrb.material = new BABYLON.StandardMaterial("endOrbMat", scene);
                Cast<BABYLON.StandardMaterial>(this.endOrb.material).emissiveColor = new BABYLON.Color3(1.0, 0.2, 0.3);

                this.startOrb.position = new BABYLON.Vector3(this._mapParams.pathTopOffset - this._mapParams.width / 2, 60, this._mapParams.height / 2 - 10);
                this.endOrb.position = new BABYLON.Vector3(this._mapParams.pathBottomOffset - this._mapParams.width / 2, 20, this._mapParams.height / -2 + 10);
            }

            public CreatePlayer(meshName: string): Player {
                var scene = this._scene;
                var playerMesh: BABYLON.Mesh;
                this.player = new Player(scene, this.mountains);

                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, x=> {
                    playerMesh = Cast<BABYLON.Mesh>(x[0]);
                    playerMesh.material = this._flatShader;
                    playerMesh.position = new BABYLON.Vector3(0, -5, 0);
                    playerMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    playerMesh.parent = parent;
                    parent.position = this.startOrb.position.clone();
                    parent.position.x += this._gameWorld.parameters.gameParameters.isHost ? 20 : -20;
                    //parent.position.z += this._gameWorld.parameters.gameParameters.isHost ? 0 : -20;

                    var cameraFollowTarget = BABYLON.Mesh.CreateSphere("fakeKid", 30, 2, scene, false);
                    cameraFollowTarget.material = new BABYLON.StandardMaterial("fakeMat", scene);
                    cameraFollowTarget.isVisible = false;
                    cameraFollowTarget.position = parent.position.clone();

                    this.player.Initialize(playerMesh);

                    scene.registerBeforeRender(() => {
                        if (this.followPlayer && !this.mainCamera.target) {
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
                });

                return this.player;
            }

            public CreateEnemy(meshName: string): Player {
                var scene = this._scene;
                var enemyMesh: BABYLON.Mesh;

                this.enemy = new Player(scene, this.mountains);

                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, x=> {
                    enemyMesh = Cast<BABYLON.Mesh>(x[0]);
                    enemyMesh.material = this._flatShader;
                    enemyMesh.position = new BABYLON.Vector3(0, -5, 0);
                    enemyMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    enemyMesh.parent = parent;
                    parent.position = this.startOrb.position.clone();
                    parent.position.x += this._gameWorld.parameters.gameParameters.isHost ? -20 : 20;

                    this.enemy.Initialize(enemyMesh);
                });

                return this.enemy;
            }

           

            private createFlatShader(): void {
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

                this._flatShader = flatShader;
            }

            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene {

                this.addLightsAndCamera();

                this.createFlatShader();

                this.addSkyDome();

                this.generateLandscape();

                this.putStartAndEnd();

                this.CreatePlayer(this._character);

                return scene;
            }

        }
    }
}