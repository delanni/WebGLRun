import express = require("express");

export module GS {
    export interface IGameParameters {
        character: string;
        debug?: boolean;
        useFlatShading?: boolean;
        isHost: boolean;
        name: string;
    }

    export interface ITerrainGeneratorParams extends IHeightMapGeneratorParams {
        subdivisions?: number;
        randomSeed?: number;
        minHeight?: number;
        maxHeight?: number;
        colors?: any[];
        heightmap?: string;
    }

    export interface IHeightMapGeneratorParams extends INoiseParameters {
        destructionLevel?: number;
        pathTopOffset?: number;
        pathBottomOffset?: number;
        shrink?: number;
        eqFactor?: number;
    }

    export interface INoiseParameters {
        random?: IRandomProvider;
        width?: number;
        height?: number;
        param?: number;
        displayCanvas?: boolean;
    }

    export interface IPlayerInfo {
        name: string;
        character: string;
    }

    export class Player implements IPlayerInfo{
        _socket: SocketIO.Socket;
        _enemyRef: Player;
        isReady: boolean;
        mapReady: boolean;
        name: string;
        character: string;
        pos: any;
        latency: number=0;

        constructor(playerInfo:IPlayerInfo , socket: SocketIO.Socket) {
            this._socket = socket;
            this.isReady = false;
            this.mapReady = false;
            this.name = playerInfo.name;
            this.character = playerInfo.character;
            this.pos = [];
        }

        public getPlayerInfo():IPlayerInfo {
            return {
                character: this.character,
                name: this.name
            }
        }

        public getPositionInfo(): any{
            return this.pos;
        }
    }

    export class Room {
        players: Player[];
        id: string;
        creationDate: number;
        mapParameters: ITerrainGeneratorParams;

        constructor(id: string) {
            this.id = id;
            this.players = [];
            this.creationDate = Date.now();
        }
    }

    export class GameServer {

        parameters: any;
        socketIO: SocketIO.Server;
        _rooms: { [roomName: string]: Room };

        static _INSTANCE: GameServer;
        static _worldDestructionFlag: boolean = false;

        static Init(socketIO: SocketIO.Server, opts?: any) {
            if (GameServer._worldDestructionFlag) {
                console.log("Already instantiated, or trying to instantiate twice?");
                return;
            }
            GameServer._worldDestructionFlag = true;
            if (GameServer.INSTANCE) {
                GameServer.INSTANCE.Dispose();
            }
            GameServer.INSTANCE = new GameServer(socketIO, opts);
            this._worldDestructionFlag = false;
        }

        constructor(socketIO: SocketIO.Server, opts?: any) {
            if (!GameServer._worldDestructionFlag) {
                throw new Error("Please do not instantiate this directly, use the static Init function");
            }
            opts = opts || {};

            this._rooms = {};
            this.socketIO = socketIO;
            this.parameters = {
                debug: true
            };

            this.parameters.debug = opts.debug || this.parameters.debug;
        }

        public Dispose() {
            delete this._rooms;
        }

        CheckIfRoomExists(id: string) {
            if (this._rooms[id]) {
                return true;
            } else {
                return false;
            }
        }

        CreateRoom(id: string) {
            var room: Room;
            var doubleCheck = this.CheckIfRoomExists(id);
            if (doubleCheck) {
                id += "_" + Math.floor(Math.random() * 5000);
                room = this._rooms[id] = new Room(id);
            } else {
                room = this._rooms[id] = new Room(id);
            }
            room.mapParameters = this.makeUpMapParameters();

            this.setUpRoomWithIO(id);

            return id;
        }

        GetRoom(id: string) {
            return this._rooms[id];
        }

        private setUpRoomWithIO(id: string) {
            var ns = "/" + id;
            var nsp = this.socketIO.of(ns);
            var room = this._rooms[id];
            express.logger("Room created " + ns);

            nsp.on("connection", socket => {
                socket.emit("welcome", { timestamp: Date.now(), host: room.players[0]&&room.players[0].getPlayerInfo() });

                socket.on("gladICouldJoin", playerInfo => {
                    var player = new Player(<IPlayerInfo>playerInfo, socket);

                    if (room.players[0]) {
                        room.players[0]._enemyRef = player;
                        player._enemyRef = room.players[0];
                    }

                    room.players.push(player);
                    socket.on("disconnect", () => {
                        clearInterval(intervalId);
                        room.players.splice(room.players.indexOf(player), 1);
                    });

                    socket.on("mapLoaded", x=> {
                        player.mapReady = true;
                        if (player._enemyRef) {
                            player._enemyRef._socket.emit("playerJoined", playerInfo);
                            player._socket.emit("playerJoined", player._enemyRef.getPlayerInfo());
                        }
                        if (x.heightmap) {
                            room.mapParameters.heightmap = x.heightmap;
                        }
                    });

                    socket.on("readyStateChanged", x=> {
                        var readyState = x.isReady;
                        var timestamp = x.timestamp;
                        player.isReady = readyState;
                        if (room.players.length == 2 &&
                            room.players.every(x=> x.mapReady && x.isReady)) {
                            nsp.emit("startGame", {
                                timeout: 10000
                            });
                        }
                        nsp.emit("readyStateChanged", x);
                    });

                    socket.on("keydown", evt => {
                        player._enemyRef._socket.emit("keydown", evt);
                    });
                    socket.on("keyup", evt => {
                        player._enemyRef._socket.emit("keyup", evt);
                    });

                    socket.on("positionUpdate", data=> {
                        data.push((player.latency+player._enemyRef.latency)/2);
                        player.pos = data;
                        player._enemyRef._socket.emit("enemyPositionUpdate", player.getPositionInfo());
                    });

                    socket.on("ping", x=> {
                        socket.emit("pong", x);
                    });

                    socket.on("pong", x=> {
                        var latency = Date.now() - x;
                        player.latency = latency;
                    });

                    var intervalId = setInterval(() => {
                        socket.emit("ping", Date.now());
                    }, 2000);
                });
            });
        }

        private makeUpMapParameters(): ITerrainGeneratorParams {
            var obj: ITerrainGeneratorParams = {
                randomSeed: this.randomInt(5000),
                destructionLevel: 10 + this.randomInt(10),
                height: 3000,
                width: 1000,
                minHeight: 0,
                maxHeight: 200 + this.randomInt(100),
                subdivisions: 250,
                param: 1.1 + Math.random(),
                pathBottomOffset: 300 + this.randomInt(200),
                pathTopOffset: 300 + this.randomInt(200),
                shrink: 1 + Math.random() * 3,
                eqFactor: 0.75 + Math.random()
            }
            return obj;
        }

        private randomInt(max: number) {
            return Math.floor(Math.random() * max);
        }

        static get INSTANCE(): GameServer {
            return GameServer._INSTANCE;
        }
        static set INSTANCE(val: GameServer) {
            if (val instanceof GameServer) GameServer._INSTANCE = val;
            else throw Error("Are you trying to mess something up?");
        }
    }
}