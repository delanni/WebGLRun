var express = require("express");
var GS;
(function (GS) {
    var Player = (function () {
        function Player(playerInfo, socket) {
            this.latency = 0;
            this._socket = socket;
            this.isReady = false;
            this.mapReady = false;
            this.name = playerInfo.name;
            this.character = playerInfo.character;
            this.pos = [];
        }
        Player.prototype.getPlayerInfo = function () {
            return {
                character: this.character,
                name: this.name
            };
        };
        Player.prototype.getPositionInfo = function () {
            return this.pos;
        };
        return Player;
    })();
    GS.Player = Player;
    var Room = (function () {
        function Room(id) {
            this.id = id;
            this.players = [];
            this.creationDate = Date.now();
        }
        return Room;
    })();
    GS.Room = Room;
    var GameServer = (function () {
        function GameServer(socketIO, opts) {
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
        GameServer.Init = function (socketIO, opts) {
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
        };
        GameServer.prototype.Dispose = function () {
            delete this._rooms;
        };
        GameServer.prototype.CheckIfRoomExists = function (id) {
            if (this._rooms[id]) {
                return true;
            }
            else {
                return false;
            }
        };
        GameServer.prototype.CreateRoom = function (id) {
            var room;
            var doubleCheck = this.CheckIfRoomExists(id);
            if (doubleCheck) {
                id += "_" + Math.floor(Math.random() * 5000);
                room = this._rooms[id] = new Room(id);
            }
            else {
                room = this._rooms[id] = new Room(id);
            }
            room.mapParameters = this.makeUpMapParameters();
            this.setUpRoomWithIO(id);
            return id;
        };
        GameServer.prototype.GetRoom = function (id) {
            return this._rooms[id];
        };
        GameServer.prototype.setUpRoomWithIO = function (id) {
            var ns = "/" + id;
            var nsp = this.socketIO.of(ns);
            var room = this._rooms[id];
            express.logger("Room created " + ns);
            nsp.on("connection", function (socket) {
                socket.emit("welcome", { timestamp: Date.now(), host: room.players[0] && room.players[0].getPlayerInfo() });
                socket.on("gladICouldJoin", function (playerInfo) {
                    var player = new Player(playerInfo, socket);
                    if (room.players[0]) {
                        room.players[0]._enemyRef = player;
                        player._enemyRef = room.players[0];
                    }
                    room.players.push(player);
                    socket.on("disconnect", function () {
                        clearInterval(intervalId);
                        room.players.splice(room.players.indexOf(player), 1);
                    });
                    socket.on("mapLoaded", function (x) {
                        player.mapReady = true;
                        if (player._enemyRef) {
                            player._enemyRef._socket.emit("playerJoined", playerInfo);
                            player._socket.emit("playerJoined", player._enemyRef.getPlayerInfo());
                        }
                        if (x.heightmap) {
                            room.mapParameters.heightmap = x.heightmap;
                        }
                    });
                    socket.on("readyStateChanged", function (x) {
                        var readyState = x.isReady;
                        var timestamp = x.timestamp;
                        player.isReady = readyState;
                        if (room.players.length == 2 && room.players.every(function (x) { return x.mapReady && x.isReady; })) {
                            nsp.emit("startGame", {
                                timeout: 10000
                            });
                        }
                        nsp.emit("readyStateChanged", x);
                    });
                    socket.on("keydown", function (evt) {
                        player._enemyRef._socket.emit("keydown", evt);
                    });
                    socket.on("keyup", function (evt) {
                        player._enemyRef._socket.emit("keyup", evt);
                    });
                    socket.on("positionUpdate", function (data) {
                        data.push((player.latency + player._enemyRef.latency) / 2);
                        player.pos = data;
                        player._enemyRef._socket.emit("enemyPositionUpdate", player.getPositionInfo());
                    });
                    socket.on("ping", function (x) {
                        socket.emit("pong", x);
                    });
                    socket.on("pong", function (x) {
                        var latency = Date.now() - x;
                        player.latency = latency;
                    });
                    var intervalId = setInterval(function () {
                        socket.emit("ping", Date.now());
                    }, 2000);
                });
            });
        };
        GameServer.prototype.makeUpMapParameters = function () {
            var obj = {
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
            };
            return obj;
        };
        GameServer.prototype.randomInt = function (max) {
            return Math.floor(Math.random() * max);
        };
        Object.defineProperty(GameServer, "INSTANCE", {
            get: function () {
                return GameServer._INSTANCE;
            },
            set: function (val) {
                if (val instanceof GameServer)
                    GameServer._INSTANCE = val;
                else
                    throw Error("Are you trying to mess something up?");
            },
            enumerable: true,
            configurable: true
        });
        GameServer._worldDestructionFlag = false;
        return GameServer;
    })();
    GS.GameServer = GameServer;
})(GS = exports.GS || (exports.GS = {}));
