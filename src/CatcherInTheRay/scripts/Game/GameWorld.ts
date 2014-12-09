///<reference path="../declarations/socket.io-client.d.ts" />

module GAME {
    export var ACCEPTED_KEYS: {} = { "32": 32, "87": 87, "68": 68, "83": 83, "65": 65, "82": 82 };

    export class GameWorld {
        _engine: BABYLON.Engine;
        _scene: BABYLON.Scene;
        _camera: BABYLON.Camera;
        _canvas: HTMLCanvasElement;
        _gui: GUI;
        _lights: BABYLON.Light[];
        _socket: SocketIOClient.Socket;
        //_players: { [name: string]: Player }
        //_players: Player[];
        _scenes: { [name: string]: SCENES.SceneBuilder } = {};

        player: Player;
        enemy: Player;

        sceneBuilder: GAME.SCENES.GameScene;

        /// DEFAULTS ARE HERE ///
        private random = new MersenneTwister(111);

        parameters: GameProperties = {
            sceneId: GAME.Scenes.GAME,
            gameParameters: {
                useFlatShading: false,
                name: ["Bill", "Jeff", "Jorma", "Teddy", "Eilene", "Georgie"][Math.floor(Math.random() * 6)],
                character: ["elk", "fox", "chowchow", "deer", "wolf", "mountainlion"][Math.floor(Math.random() * 6)],
                isHost: false
            },
            mapParameters: {
                randomSeed: 111,
                destructionLevel: 13,
                displayCanvas: false,
                height: 1500,
                width: 600,
                minHeight: 0,
                maxHeight: 300,
                subdivisions: 200,
                random: this.random,
                param: 1.1,
                pathBottomOffset: 300,
                pathTopOffset: 300,
                shrink: 1.7,
                eqFactor: 1
            }
        };

        constructor(canvasId: string, parameters: GameProperties, socket: SocketIOClient.Socket, fullify?: string) {
            BABYLON.Engine.ShadersRepository = "/scripts/Shaders/";

            this._socket = socket;
            this._canvas = Cast<HTMLCanvasElement>(document.getElementById(canvasId));
            this._engine = new BABYLON.Engine(this._canvas);

            if (fullify) {
                this.extendCanvas(FullifyStates.HARD);
            }

            if (!parameters || !(parameters instanceof Object)) {
                this._gui = new GUI(this);
            } else {
                UTILS.Mixin(parameters, this.parameters, false);
            }

            this.appendHandlers(this._socket);
        }

        public Load(properties: GameProperties) {
            properties = UTILS.Mixin(properties, this.parameters, false);
            var random = new MersenneTwister(properties.mapParameters.randomSeed);
            properties.mapParameters.random = random;
            this._engine.displayLoadingUI().then(() => {
                this.applyParameters(properties);
                this.loadScene(properties.sceneId);
                if (this.parameters.gameParameters.isHost) {
                    var c = <HTMLCanvasElement>document.getElementById("mainNoiseCanvas");
                    var dataurl = c.toDataURL();
                    this._socket.emit("mapLoaded", { timestamp: Date.now(), heightmap: dataurl });
                } else {
                    this._socket.emit("mapLoaded", { timestamp: Date.now() });
                }
                this._engine.hideLoadingUI();
                this.hookKeyboardTo(this.sceneBuilder.player.Controller);
                this.player = this.sceneBuilder.player;
            });
        }

        private hookSocketTo(controller: any) {
            var socket = this._socket;

            socket.on("keydown", evt=> {
                if (evt.keyCode in ACCEPTED_KEYS) {
                    if (controller[evt.keyCode] === 0) {
                        controller[evt.keyCode] = 1;
                    }
                }
            });
            socket.on("keyup", evt=> {
                if (evt.keyCode in ACCEPTED_KEYS) {
                    controller[evt.keyCode] = 0;
                }
            });
        }

        private hookKeyboardTo(controller: any) {
            window.addEventListener("keydown", evt=> {
                if (evt.keyCode in ACCEPTED_KEYS) {
                    this._socket.emit("keydown", { keyCode: evt.keyCode });
                    if (controller[evt.keyCode] === 0) {
                        controller[evt.keyCode] = 1;
                    }
                    evt.preventDefault();
                }
            });
            window.addEventListener("keyup", evt=> {
                if (evt.keyCode in ACCEPTED_KEYS) {
                    this._socket.emit("keyup", { keyCode: evt.keyCode });
                    controller[evt.keyCode] = 0;
                    evt.preventDefault();
                }
            });
        }

        private appendHandlers(socket: SocketIOClient.Socket) {
            socket.on("welcome", x=> {
                console.log("Successfully logged in at " + x.timestamp);
                socket.emit("gladICouldJoin", {
                    name: this.parameters.gameParameters.name,
                    character: this.parameters.gameParameters.character
                });
                // this is info about me
                window.postMessage({
                    playerInfo: { name: this.parameters.gameParameters.name }
                }, window.location.href);
            });

            socket.on("playerJoined", playerInfo=> {
                var enemy = this.sceneBuilder.CreateEnemy(playerInfo.character);
                this.hookSocketTo(enemy.Controller);
                this.enemy = enemy;

                // this is info about the enemigo
                window.postMessage({
                    playerInfo: { name: playerInfo.name }
                }, window.location.href);
            });

            socket.on("enemyPositionUpdate", positionInfo=> {
                this.enemy.pushUpdate(positionInfo);
            });

            socket.on("ping", x=> {
                socket.emit("pong", { timestamp: Date.now() });
            });

            socket.on("pong", x=> {
                console.log("pong", x);
            });

            socket.on("startGame", x=> {
                var timeout = x.timeout;
                setTimeout(() => {
                    this.Start();
                }, timeout);
                setTimeout(() => {
                    this.countdown(timeout);
                }, 0);
                this.startRenderLoop();
            });
        }
        _lastPositionUpdate: number = 0;

        private startRenderLoop() {
			this._scene.registerBeforeRender(() => {
                var now = Date.now();
                if (now - this._lastPositionUpdate > 1000) {
                    this._lastPositionUpdate = now;
                    this._socket.emit("positionUpdate",
                        [
                            this.player.parent.position.asArray(),
                            this.player.parent.rotationQuaternion.asArray(),
                            this.player.velocity.asArray(),
                            now
                        ]);
                }
            });
            BABYLON.Tools.QueueNewFrame(() => this.renderLoop());
        }

        public Start() {
            console.info("Started!");
            this.player && this.player.SetEnabled(true);
            this.enemy && this.enemy.SetEnabled(true);
        }

        private countdown(timeoutms: number) {
            console.info("Game starts in " + timeoutms / 1000 + "!");
            window.postMessage({
                timeoutms: timeoutms
            }, window.location.href);
            if (timeoutms >= 0) {
                setTimeout(() => {
                    this.countdown(timeoutms - 1000);
                }, 1000);
            }
        }

        private applyParameters(guiParams: GameProperties) {
            this.buildScenes(guiParams);
        }

        private buildScenes(parameters: GameProperties) {
            switch (parameters.sceneId) {
                case Scenes.TEST:
                    var testScene = new SCENES.TestScene(this);
                    this._scenes["TEST"] = testScene;
                    break;

                case Scenes.GAME:
                    var gameScene = new SCENES.GameScene(this,
                        parameters.gameParameters, parameters.mapParameters);
                    this.sceneBuilder = gameScene;
                    this._scenes["GAME"] = gameScene;
                    break;
                case Scenes.ANIMAL:
                    var animalScene = new SCENES.AnimalScene(this);
                    this._scenes["ANIMAL"] = animalScene;
                    break;
                case Scenes.TERRAINGEN:
                    var terrainGenScene = new SCENES.TerrainGenScene(this, parameters.gameParameters, parameters.mapParameters);
                    this._scenes["TERRAINGEN"] = terrainGenScene;
                    break;
            }
        }

        private extendCanvas(fullify: FullifyStates) {
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

        private renderLoop() {
            this._engine.beginFrame();
            if (this._scene) {
                this._scene.render();
            }
            this._engine.endFrame();
            BABYLON.Tools.QueueNewFrame(() => this.renderLoop());
        }

        private loadScene(s: Scenes) {
            var debugItems = document.getElementsByClassName("DEBUG");
            for (var i = 0; debugItems.length > 0;) {
                debugItems[i].parentNode.removeChild(debugItems[i]);
            }

            switch (s) {
                case Scenes.TEST:
                    this._scene = this._scenes["TEST"].BuildScene();
                    break;
                case Scenes.GAME:
                    this._scene = this._scenes["GAME"].BuildScene();
                    break;
                case Scenes.ANIMAL:
                    this._scene = this._scenes["ANIMAL"].BuildScene();
                    break;
                case Scenes.TERRAINGEN:
                    this._scene = this._scenes["TERRAINGEN"].BuildScene();
                    break;
            }
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
        GAME = 2,
        ANIMAL = 3,
        TERRAINGEN = 4,
        EXPLORE = 5
    };

}