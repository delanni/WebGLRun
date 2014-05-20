module GAME {
    export module SCENES {
        export class SceneBuilder {
            _gameWorld: GAME.GameWorld;

            constructor(gameWorld: GAME.GameWorld) {
                this._gameWorld = gameWorld;
            }

            public BuildScene(): BABYLON.Scene {
                var scene = new BABYLON.Scene(this._gameWorld._engine);
                return this.BuildSceneAround(scene);
            }

            public BuildSceneAround(scene: BABYLON.Scene): BABYLON.Scene {
                throw new Error('This method is abstract');
            }

            public SetParameters(params: any) {
                throw new Error('This method is abstract');
            }

        }
    }
}