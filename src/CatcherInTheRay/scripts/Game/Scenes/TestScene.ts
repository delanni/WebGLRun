/// <reference path="SceneBuilder.ts" />
module GAME {
     export module SCENES {
        export class TestScene extends GAME.SCENES.SceneBuilder {

            constructor(gameWorld: GAME.GameWorld) {
                super(gameWorld);
            }

            BuildSceneAround(scene: BABYLON.Scene) {

                var torusKnot: BABYLON.Mesh;
                var model: BABYLON.Mesh;

                var light = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0, -1, -0.5), scene);
                light.position = new BABYLON.Vector3(0, 70, 0);
                var shadowGen = new BABYLON.ShadowGenerator(1024, light);

                var camera = new BABYLON.ArcRotateCamera("Camera", 10, 20, 30, new BABYLON.Vector3(0, 0, 0), scene);
                camera.attachControl(this._gameWorld.canvas);

                torusKnot = BABYLON.Mesh.CreateTorusKnot("torusknot", 3, 2, 80, 30, 4, 4, scene, true);
                torusKnot.position.x += 10;
                torusKnot.position.z += 10;
                shadowGen.getShadowMap().renderList.push(torusKnot);

                BABYLON.SceneLoader.ImportMesh(["fox"], "/models/", "fox.babylon", scene, (m) => {
                    model = Cast<BABYLON.Mesh>(m[0]);
                    model.material = weirdShaderMat;
                    model.position.addInPlace(new BABYLON.Vector3(-20, 0, -20));
                    shadowGen.getShadowMap().renderList.push(model);
                });

                var weirdShaderMat = new BABYLON.ShaderMaterial("weirdShader", scene, "weird", {
                    attributes: ["position", "normal"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                });

                torusKnot.material = weirdShaderMat;


                var plane = BABYLON.Mesh.CreatePlane("plane", 100, scene, false);
                plane.position = new BABYLON.Vector3(0, -20, 0);
                plane.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.LOCAL);
                plane.receiveShadows = true;
                var planeMaterial = new BABYLON.StandardMaterial("standi", scene);
                planeMaterial.specularColor = BABYLON.Color3.Yellow();
                planeMaterial.specularPower = 0;
                planeMaterial.diffuseColor = BABYLON.Color3.Blue();
                plane.material = planeMaterial;

                scene.registerBeforeRender(() => {
                    torusKnot.rotate(BABYLON.Vector3.Up(), 0.01, BABYLON.Space.LOCAL);
                    weirdShaderMat.setFloat("time", (Date.now() / 1000) % (Math.PI*2));
                });

                return scene;
            }
        }
    }
}