/// <reference path="Typescript/babylon.d.ts" />
/// <reference path="references.ts" />
var GAME;
(function (GAME) {
    var Game = (function () {
        function Game() {
            this.gameWorld = new BABYLON.GameFX.GameWorld("mainCanvas", "hard");
            this.engine = this.gameWorld.engine;
            this.scene = this.gameWorld.scene;
            this.camera = this.gameWorld.camera;
            this.canvas = this.gameWorld.canvas;

            this.items = {};
            this.items["box1"] = BABYLON.Mesh.CreateBox("box1", 5, this.scene);
            this.items["box1"].material = new BABYLON.StandardMaterial("m1", this.scene);
            this.items["light1"] = new BABYLON.PointLight("light1", new BABYLON.Vector3(10, 100, 10), this.scene);

            this.camera.attachControl(this.canvas);
        }
        Game.prototype.init = function () {
            this.gameWorld.startGameLoop(this.animate);
        };

        Game.prototype.animate = function () {
            this.items["box1"].rotation.x += 0.01;
        };
        return Game;
    })();
    GAME.Game = Game;
})(GAME || (GAME = {}));
//# sourceMappingURL=app.js.map
