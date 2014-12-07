/// <reference path="SceneBuilder.ts" />
module GAME {
    export module SCENES {
        export class AnimalScene extends GAME.SCENES.SceneBuilder {

            constructor(gameWorld: GAME.GameWorld) {
                super(gameWorld);
            }

            BuildSceneAround(scene: BABYLON.Scene) {

                // Adding light
                this._gameWorld._lights = [];

                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;
                this._gameWorld._lights.push(light);


                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;
                this._gameWorld._lights.push(antiLight);

                // Camera
                var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), scene);
                camera.ellipsoid = new BABYLON.Vector3(8, 10, 8);
                camera.checkCollisions = true;
                if (this._gameWorld._camera) this._gameWorld._camera.dispose();
                this._gameWorld._camera = camera;
                camera.attachControl(this._gameWorld._canvas);
                camera.maxZ = 10000;
                camera.speed = 8;

                var animals = {};
                var animalNames = ["bear", "fox", "wolf", "retreiver", "mountainlion", "tarbuffaloA", "vulture", "panther", "elk", "chowchow", "wolfFoxBear"];
                var loader = BABYLON.SceneLoader;

                for (var i = 0; i < animalNames.length; i++) {
                    // cheat :)
                    (function () {
                        var animal = animalNames[i];
                        var index = i;
                        loader.ImportMesh([animal], "models/", animal + ".babylon", scene, x=> {
                            console.log(animal, x);
                            var _animal = animal;
                            console.log(_animal + " loaded.");
                            animals[_animal] = x[0];
                            var a = Cast<BABYLON.Mesh>(x[0]);
                            Cast<any>(scene)._physicsEngine._unregisterMesh(a);
                            a.position.x = index * 60;
                            a.position.z = index * 80;

                            var shaderMaterial = new BABYLON.ShaderMaterial("flatShader", scene, "flat", {
                                attributes: ["position", "normal", "uv", "color"],
                                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                            });
                            shaderMaterial.setVector3("cameraPosition", camera.position);
                            shaderMaterial.setVector3("light1Position", light.position);
                            shaderMaterial.setVector3("light2Position", antiLight.position);
                            shaderMaterial.setVector3("light1Color", BABYLON.Vector3.FromArray(light.diffuse.asArray()));
                            shaderMaterial.setVector3("light2Color", BABYLON.Vector3.FromArray(antiLight.diffuse.asArray()));

                            a.material = shaderMaterial;
                            if (a.animations[0]) {
                                a.animations[0]._target = a;
                                Cast<any>(a).__defineSetter__("vertexData", function (val) {
                                    a.setVerticesData(BABYLON.VertexBuffer.PositionKind, val, true);
                                });
                            }
                        }, null, x=> { console.error("Failed to load.", arguments); });
                    })();
                }

                scene.registerBeforeRender(() => {
                });

                window.addEventListener("click", function (evt) {
                    // We try to pick an object
                    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
                    var mesh = pickResult.pickedMesh;
                    if (!mesh) return;
                    if (evt.ctrlKey) {
                        mesh.material.wireframe = !pickResult.pickedMesh.material.wireframe;
                    } else {
                        scene.beginAnimation(mesh, 0, mesh.animations[0].getKeys().length + 1, true, 1 + Math.random() *10);
                    }
                });

                return scene;
            }
        }
    }
} 