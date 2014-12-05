/// <reference path="SceneBuilder.ts" />
module GAME {
     export module SCENES {
        export class TestScene extends GAME.SCENES.SceneBuilder {

            constructor(gameWorld: GAME.GameWorld) {
                super(gameWorld);
            }

            BuildSceneAround(scene: BABYLON.Scene) {

                var torusKnot: BABYLON.Mesh;

                var light = new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 10, 0), scene);

                var camera = new BABYLON.ArcRotateCamera("Camera", 10, 20, 30, new BABYLON.Vector3(0, 0, 0), scene);
                camera.attachControl(this._gameWorld._canvas);

                torusKnot = BABYLON.Mesh.CreateTorusKnot("torusknot", 3, 2, 80, 30, 4, 4, scene, true);

                scene.registerBeforeRender(() => {
                    torusKnot.rotate(BABYLON.Vector3.Up(), 0.01, BABYLON.Space.LOCAL);
                });

                return scene;
            }
        }
    }
}