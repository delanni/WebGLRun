module GAME {
    export module SCENES {
        export interface GameParameters {
            randomSeed: number;
            random: IRandomProvider;
            character: string;
            debug?: boolean;
            useFlatShading?: boolean;
        }

        export class GameScene extends SceneBuilder {
            _randomSeed: number;
            _debug: boolean;
            _useFlatShading: boolean;
            _mapParams: TERRAIN.HeightMapGeneratorParams;
            _physicsEngine: BABYLON.OimoJSPlugin;
            _character: string;
            _flatShader: BABYLON.ShaderMaterial;

            mainCamera: BABYLON.FollowCamera;
            followPlayer: boolean;

            startOrb: BABYLON.Mesh;
            endOrb: BABYLON.Mesh;
            mountains: BABYLON.Mesh;
            
            player: GAME.Player;

            constructor(gameWorld: GAME.GameWorld, parameters: GameParameters, mapParameters: TERRAIN.HeightMapGeneratorParams) {
                this._randomSeed = parameters.randomSeed;
                this._debug = parameters.debug || true;
                this._useFlatShading = parameters.useFlatShading;
                this._character = parameters.character;
                this._mapParams = mapParameters;

                this.followPlayer = true;

                super(gameWorld);
            }

            private addLightsAndCamera(scene: BABYLON.Scene): void {
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


                // Camera
                // var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), scene);
                // camera.ellipsoid = new BABYLON.Vector3(8, 10, 8);
                //// camera.checkCollisions = true;
                // if (this._gameWorld._camera) this._gameWorld._camera.dispose();
                // this._gameWorld._camera = camera;
                // camera.attachControl(this._gameWorld._canvas);
                // camera.maxZ = 10000;
                // camera.speed = 8;
                this.mainCamera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 1000, 0), scene);
                this.mainCamera.maxZ = 10000;
                this.mainCamera.speed = 8;
            }

            private addSkyDome(scene: BABYLON.Scene): void {
                // Skybox
                var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
                skybox.rotation.y = 1.2;
                var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
                skyboxMaterial.backFaceCulling = false;
                skybox.material = skyboxMaterial;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.reflectionTexture = Cast<BABYLON.Texture>(new BABYLON.CubeTexture(
                    "../assets/Skybox/skyrender", scene,
                    //  +x          +y          +z          -x          -y          -z
                    ["0006.png", "0002.png", "0001.png", "0003.png", "0005.png", "0004.png"]));
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skybox.checkCollisions = false;
            }

            private generateLandscape(scene: BABYLON.Scene): void {
                // Landscape generation
                var heightMapGenerator = new TERRAIN.HeightMapGenerator(this._mapParams);
                var noise = heightMapGenerator.GenerateHeightMap();

                // Terrain from the heightmap
                var terrainGenerator = new TERRAIN.TerrainGenerator({
                    displayCanvas: this._mapParams.displayCanvas,
                    height: this._mapParams.height,
                    width: this._mapParams.width,
                    maxHeight: this._mapParams.maxHeight,
                    minHeight: this._mapParams.minHeight,
                    subdivisions: this._mapParams.subdivisions
                });

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
                mountainSideMaterial.bumpTexture = new BABYLON.Texture("assets/noisenormals.jpg", scene);
            }

            private putStartAndEnd(scene: BABYLON.Scene) {
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

            private createPlayer(scene: BABYLON.Scene, meshName: string): void {

                var playerMesh: BABYLON.Mesh;

                BABYLON.SceneLoader.ImportMesh([meshName], "models/", meshName+".babylon", scene, x=> {
                    playerMesh = Cast<BABYLON.Mesh>(x[0]);
                    playerMesh.material = this._flatShader;
                    playerMesh.position = new BABYLON.Vector3(0, -5, 0);
                    playerMesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);

                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    playerMesh.parent = parent;
                    parent.position = this.startOrb.position.clone();

                    var cameraFollowTarget = BABYLON.Mesh.CreateSphere("fakeKid", 30, 2, scene, false);
                    cameraFollowTarget.material = new BABYLON.StandardMaterial("fakeMat", scene);
                    cameraFollowTarget.isVisible = false;
                    cameraFollowTarget.position = parent.position.clone();

                    this.player = new Player(playerMesh,this.mountains, scene);

                    scene.registerBeforeRender(()=>{
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
                            this.mainCamera.rotationOffset = UTILS.Utils.Clamp((this.player.CurrentRotation%Math.PI)/Math.PI*180, -45,45);
                        }
                    });
                });
            }

            private createFlatShader(scene: BABYLON.Scene): void {
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

                //this._physicsEngine = new BABYLON.OimoJSPlugin();
                //scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), this._physicsEngine );

                this.addLightsAndCamera(scene);

                this.createFlatShader(scene);

                this.addSkyDome(scene);

                this.generateLandscape(scene);

                this.putStartAndEnd(scene);

                this.createPlayer(scene, this._character);

                //window.addEventListener("click", function () {
                //    // We try to pick an object
                //    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
                //    console.log(pickResult);
                //});

                return scene;
            }

        }
    }
}