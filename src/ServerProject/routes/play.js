///<reference path="../GameServer.ts" />
var soupGen = require('../soupgen');
var gs = require("../GameServer");
var GS = gs.GS;
function createRoom(req, res) {
    var gameServer = GS.GameServer.INSTANCE;
    var gameId = req.param("gameId", null);
    while (!gameId) {
        gameId = soupGen.Generate(15);
        var result = gameServer.CheckIfRoomExists(gameId);
        if (!result) {
            gameId = gameServer.CreateRoom(gameId);
        }
        else {
            gameId = null;
        }
    }
    res.json({ url: gameId });
}
exports.createRoom = createRoom;
function play(req, res) {
    var gameServer = GS.GameServer.INSTANCE;
    var gameId = req.param("gameId", null);
    var room = gameServer.GetRoom(gameId);
    if (!room)
        res.redirect("/error/roomdisappeared");
    var isHost = room.players.length == 0;
    var character = req.param("character") || null;
    var name = req.param("name").replace("Your name here", "") || null;
    var gameObj = {
        gameId: gameId,
        gameParams: {
            character: character,
            useFlatShading: false,
            debug: false,
            name: name,
            isHost: isHost
        },
        mapParams: room.mapParameters
    };
    res.render('play', gameObj);
}
exports.play = play;
;
//# sourceMappingURL=play.js.map