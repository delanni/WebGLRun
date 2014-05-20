module GAME {
    export module SCENES {
        export interface GameParameters {
            randomSeed: number;
            debug?: boolean;
            useFlatShading?: boolean;
        }

        export class GameScene extends SceneBuilder {
            _randomSeed: number;
            _debug: boolean;
            _useFlatShading: boolean;
            _mapParams: TERRAIN.LandscapeGeneratorParameters;

            constructor(gameWorld: GAME.GameWorld, parameters: GameParameters, mapParameters: TERRAIN.LandscapeGeneratorParameters) {
                this._randomSeed = parameters.randomSeed;
                this._debug = parameters.debug || true;
                this._useFlatShading = parameters.useFlatShading;
                this._mapParams = mapParameters;
                if (this._useFlatShading) {
                    this._mapParams.submesh = Math.min(this._mapParams.submesh, 100);
                }
                super(gameWorld);
            }

            BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene {

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
                var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), scene);
                camera.ellipsoid = new BABYLON.Vector3(8, 10, 8);
                camera.checkCollisions = true;
                if (this._gameWorld._camera) this._gameWorld._camera.dispose();
                this._gameWorld._camera = camera;
                camera.attachControl(this._gameWorld._canvas);
                camera.maxZ = 10000;
                camera.speed = 8;


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


                // Landscape generation
                var landscapeGenerator = new TERRAIN.LandscapeGenerator(this._mapParams);

                var terrainMesh = landscapeGenerator.GenerateOn(scene);
                if (this._useFlatShading) {
                    terrainMesh.convertToFlatShadedMesh();
                    var convertedVertices = terrainMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                    console.log("Vertices after conversion: " + convertedVertices.length);
                }

                var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                terrainMesh.material = groundMaterial;
                groundMaterial.specularPower = 0;
                groundMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                terrainMesh.checkCollisions = true;

                // Put start and end
                var startOrb = BABYLON.Mesh.CreateSphere("startOrb", 30, 30, scene, true);
                startOrb.material = new BABYLON.StandardMaterial("startOrbMat", scene);
                Cast<BABYLON.StandardMaterial>(startOrb.material).emissiveColor = new BABYLON.Color3(0.3, 1.0, 0.2);
                var endOrb = BABYLON.Mesh.CreateSphere("endOrb", 30, 30, scene, true);
                endOrb.material = new BABYLON.StandardMaterial("endOrbMat", scene);
                Cast<BABYLON.StandardMaterial>(endOrb.material).emissiveColor = new BABYLON.Color3(1.0, 0.2, 0.3);

                startOrb.position = new BABYLON.Vector3(this._mapParams.pathTopOffset - this._mapParams.width / 2, 20, this._mapParams.height / 2 - 10);
                endOrb.position = new BABYLON.Vector3(this._mapParams.pathBottomOffset - this._mapParams.width / 2, 20, this._mapParams.height / -2 + 10);



                return scene;

            }

        }
    }
}