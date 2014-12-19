///<reference path="../declarations/socket.io-client.d.ts" />

module GAME {
    export var ACCEPTED_KEYS: {} = { "32": 32, "87": 87, "68": 68, "83": 83, "65": 65, "82": 82 };

    export class GameWorld {
        private _gui: GUI;
        private _socket: SocketIOClient.Socket;
        private _scenes: { [name: string]: SCENES.SceneBuilder } = {};
        private _lastPositionUpdate: number = 0;

        engine: BABYLON.Engine;
        scene: BABYLON.Scene;
        camera: BABYLON.Camera;
        canvas: HTMLCanvasElement;
        player: Player;
        enemy: Player;
        collectibles: BABYLON.Mesh[];

        /// DEFAULTS ARE HERE ///

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
            this.canvas = Cast<HTMLCanvasElement>(document.getElementById(canvasId));
            this.engine = new BABYLON.Engine(this.canvas);

            if (fullify) {
                this.extendCanvas(FullifyStates.HARD);
            }

            if (!parameters || !(parameters instanceof Object)) {
                this._gui = new GUI(this);
            } else {
                UTILS.Mixin(parameters, this.parameters, false);
            }

            if (this._socket) {
                this.appendHandlers(this._socket);
            }
        }

        public Load(properties: GameProperties): UTILS.Chainable<any> {
            var deferred = new UTILS.Chainable();
            properties = UTILS.Mixin(properties, this.parameters, false);
            this.engine.displayLoadingUI("Generating map, please wait...").then(() => {
                this.applyParameters(properties);
                this.loadScene(properties.sceneId);
                if (this.parameters.gameParameters.isHost) {
                    var c = <HTMLCanvasElement>document.getElementById("mainNoiseCanvas");
                    var dataurl = c.toDataURL();
                    this.emit("mapLoaded", { timestamp: Date.now(), heightmap: dataurl });
                } else {
                    this.emit("mapLoaded", { timestamp: Date.now() });
                }

                this.engine.hideLoadingUI().then(() => {
                    deferred.call();
                });

                if (properties.sceneId == Scenes.GAME) {
                    var gameScene = Cast<SCENES.GameScene>(this._scenes["GAME"]);
                    this.hookKeyboardTo(gameScene.player.Controller);
                    this.player = gameScene.player;
                    this.collectibles = gameScene.collectibles;
                } else if (properties.sceneId == Scenes.EXPLORE) {
                    var exploreScene = Cast<SCENES.ExploreScene>(this._scenes["EXPLORE"]);
                    this.hookKeyboardTo(exploreScene.player.Controller);
                    this.player = exploreScene.player;
                    this.collectibles = exploreScene.collectibles;
                    this.player.setEnabled(true);
                }
            });
            return deferred;
        }

        private emit(messageType: string, args: any) {
            if (this._socket) {
                this._socket.emit.apply(this._socket, arguments);
            }
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
                    this.emit("keydown", { keyCode: evt.keyCode });
                    if (controller[evt.keyCode] === 0) {
                        controller[evt.keyCode] = 1;
                    }
                    evt.preventDefault();
                }
            });
            window.addEventListener("keyup", evt=> {
                if (evt.keyCode in ACCEPTED_KEYS) {
                    this.emit("keyup", { keyCode: evt.keyCode });
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
                    playerInfo: {
                        name: this.parameters.gameParameters.name,
                        playerType: "player",
                        character: this.parameters.gameParameters.character
                    }
                }, window.location.href);
            });

            socket.on("playerJoined", playerInfo=> {
                var gameScene = Cast<SCENES.GameScene>(this._scenes["GAME"]);
                var enemy = gameScene.CreateEnemy(playerInfo.character);
                this.hookSocketTo(enemy.Controller);
                this.enemy = enemy;

                // this is info about the enemigo
                window.postMessage({
                    playerInfo: {
                        name: playerInfo.name,
                        playerType: "enemy",
                        character: playerInfo.character
                    }
                }, window.location.href);
            });

            socket.on("enemyPositionUpdate", positionInfo=> {
                this.enemy.PushUpdate(positionInfo);
            });

            socket.on("ping", x=> {
                socket.emit("pong", x);
            });

            socket.on("pong", x=> {
                console.log("pong", Date.now() - x);
            });

            socket.on("startGame", x=> {
                var timeout = x.timeout;
                setTimeout(() => {
                    this.start();
                }, timeout);
                this.StartRenderLoop();
            });

            socket.on("collectibleCollected", x=> {
                var c = Cast<BABYLON.Mesh>(this.scene.getMeshByName(x.collectibleName));
                if (!c) return;
                else {
                    this.scene.meshes.splice(this.scene.meshes.indexOf(c), 1);
                    this.collectibles.splice(this.collectibles.indexOf(c), 1);
                    c.isVisible = false;
                }
            });

            socket.on("gameOver", x=> {
                this.stopGame(true,true);
            });

            socket.on("playerDied", x=> {
                if (this.parameters.gameParameters.name == x.playerName) {
                    this.player.setEnabled(false);
                } else {
                    this.enemy.setEnabled(false);
                }
            });
        }

        public StartRenderLoop() {
            this.scene.registerBeforeRender(() => {
                if (!this.player) return;

                // handle player death
                if (this.player.IsEnabled && this.player.parent.position.y < -50) {

                    this.emit("playerDied", { playerName: this.parameters.gameParameters.name, timestamp : Date.now() });

                    // if enemy still plays, put cam to him
                    var gameScene = Cast<SCENES.GameScene>(this._scenes["GAME"]);
                    if (gameScene.enemy.IsEnabled) {
                        this.stopGame(true, false);
                        window.postMessage({
                            playerDied: true
                        }, window.location.href);

                        gameScene.mainCamera.target = gameScene.enemy.parent;
                    } else {
                        // else the server should shut us down
                        this.stopGame(true, true);
                    }
                }

                // Main game logic about collectibles
                for (var i = 0; i < this.collectibles.length; i++) {
                    var c = this.collectibles[i];
                    var distance = this.player.parent.position.subtract(c.position).length();
                    if (distance < 7) {
                        this.scene.meshes.splice(this.scene.meshes.indexOf(c), 1);
                        this.collectibles.splice(i--, 1);
                        c.isVisible = false;
                        this.emit("collectibleCollected", { collectibleName: c.name, timestamp: Date.now() });
                    } else if (distance < 15) {
                        c.position = BABYLON.Vector3.Lerp(c.position, this.player.parent.position, 0.5);
                    }
                }

                // Communicating positions and such
                if (!this._socket) return;
                var now = Date.now();
                if (now - this._lastPositionUpdate > 1000) {
                    this._lastPositionUpdate = now;
                    this.emit("positionUpdate",
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

        private start() {
            console.info("Started!");
            this.player && this.player.setEnabled(true);
            this.enemy && this.enemy.setEnabled(true);
        }

        private stopGame(stopPlayer,stopEnemy) {
            console.info("Game over!");
            this.player && this.player.setEnabled(!stopPlayer);
            this.enemy && this.enemy.setEnabled(!stopEnemy);
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
                case Scenes.EXPLORE:
                    var exploreScene = new SCENES.ExploreScene(this, parameters.gameParameters, parameters.mapParameters);
                    this._scenes["EXPLORE"] = exploreScene;
                    break;
            }
        }

        private extendCanvas(fullify: FullifyStates) {
            var parent = this.canvas.parentElement;
            if (fullify == FullifyStates.NO) return;

            var resize = () => {
                if (fullify === FullifyStates.HARD) {
                    this.canvas.width = this.canvas.parentElement.clientWidth;
                    this.canvas.height = this.canvas.parentElement.clientHeight;
                    this.engine.resize();
                } else {
                    this.canvas.style["width"] = "100%";
                    this.canvas.style["height"] = "100%";
                }
            };

            window.onresize = resize;
            resize();
        }

        private renderLoop() {
            this.engine.beginFrame();
            if (this.scene) {
                this.scene.render();
            }
            this.engine.endFrame();
            BABYLON.Tools.QueueNewFrame(() => this.renderLoop());
        }

        private loadScene(s: Scenes) {
            var debugItems = document.getElementsByClassName("DEBUG");
            for (var i = 0; debugItems.length > 0;) {
                debugItems[i].parentNode.removeChild(debugItems[i]);
            }

            if (this.scene) {
                this.scene.dispose();
            }

            switch (s) {
                case Scenes.TEST:
                    this.scene = this._scenes["TEST"].BuildScene();
                    break;
                case Scenes.GAME:
                    this.scene = this._scenes["GAME"].BuildScene();
                    break;
                case Scenes.ANIMAL:
                    this.scene = this._scenes["ANIMAL"].BuildScene();
                    break;
                case Scenes.TERRAINGEN:
                    this.scene = this._scenes["TERRAINGEN"].BuildScene();
                    break;
                case Scenes.EXPLORE:
                    this.scene = this._scenes["EXPLORE"].BuildScene();
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