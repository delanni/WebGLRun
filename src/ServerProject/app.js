///<reference path="./GameServer.ts" />
///<reference path="./routes/play.ts" />
var express = require("express");
var routes = require("./routes/index");
var play = require("./routes/play");
var http = require("http");
var path = require("path");
var io = require("socket.io");
var gs = require("./GameServer");
var querystring = require('querystring');
var GS = gs.GS;
var app = express();
// all environments
app.set("port", process.env.RRPORT || process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
var stylus = require("stylus");
app.use(stylus.middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
// development only
if ("development" === app.get("env")) {
    app.use(express.errorHandler());
}
app.get("/", routes.index);
app.get("/createRoom", play.createRoom);
app.post("/play", play.play);
app.get("/play", function (req, res) {
    res.redirect("/");
});
app.post("/play/:gameId", play.play);
app.get("/play/:gameId", function (req, res) {
    var gameId = req.param("gameId", null);
    if (!gameId)
        res.redirect("/");
    var qs = {
        gameId: gameId,
        character: req.param("character"),
        name: req.param("name")
    };
    var append = querystring.stringify(qs);
    res.redirect("/#?" + append);
});
app.get("/error/:errorType", function (req, res) {
    var type = req.param("errorType", "Unknown");
    express.logger("Error" + type);
    res.render("error", { type: type, timestamp: Date.now() });
});
var server = http.createServer(app);
server.listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
});
var socketIo = io.listen(server);
var gameServer = GS.GameServer.Init(socketIo);
socketIo.on("connection", function (x) {
    console.log("User connected");
});
console.log("Socket IO listening on", app.get("port"));
