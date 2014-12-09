///<reference path="../GameServer.ts" />

import express = require('express');
import soupGen = require('../soupgen');
import gs = require("../GameServer");

var GS = gs.GS;

export interface IPlayParameters {
    gameId: string;
    gameParams: gs.GS.IGameParameters;
    mapParams: gs.GS.ITerrainGeneratorParams;
}

export function createRoom(req: express.Request, res: express.Response) {
    var gameServer = GS.GameServer.INSTANCE;

    var gameId = req.param("gameId", null);

    while (!gameId) {
        gameId = soupGen.Generate(15);
        var result = gameServer.CheckIfRoomExists(gameId);
        if (!result) {
            gameId = gameServer.CreateRoom(gameId);
        } else {
            gameId = null;
        }
    }
    res.json({ url: gameId });
}

export function play(req: express.Request, res: express.Response) {
    var gameServer = GS.GameServer.INSTANCE;

    var gameId = req.param("gameId", null);

    var room = gameServer.GetRoom(gameId);
    if (!room) res.redirect("/error/roomdisappeared");

    var isHost = room.players.length == 0;
    var character = req.param("character") || null;
    var name = req.param("name").replace("Your name here", "") || null;
    var gameObj: IPlayParameters = {
        gameId: gameId,
        gameParams: {
            character: character,
            useFlatShading: false,
            debug: false,
            name: name,
            isHost: isHost
        },
        mapParams: room.mapParameters
    }

    res.render('play',gameObj);
};