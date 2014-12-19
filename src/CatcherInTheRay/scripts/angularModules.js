var indexModule = angular.module("indexModule", []);

indexModule.controller("loginController", function ($scope, $location) {
    $scope.characters = [{
        characterId: "fox",
        name: "Foxy Dee",
        description: "Among the first ones to enter the ravine, Foxy has never failed in race. She is the smartest, she majored in the field of economics."
    }, {
        characterId: "elk",
        name: "Z",
        description: "Z was once a well-known reindeer all around the northern pole. He was the trainer of such reindeer-celebrities as Rudolf or Donner. He lost to alcoholism, he no longer accepts requests to public interviews."
    }, {
        characterId: "deer",
        name: "Bambi Bombay",
        description: "Bambi is an aspiring porn actress. As soon as she became 21 deer years old she went out to LA, to pursue her dreams."
    }, {
        characterId: "moose",
        name: "Meatball",
        description: "He likes to eat."
    }, {
        characterId: "mountainlion",
        name: "Amadeus III.",
        description: "As usual, he was not named after his talent or ambitions towards music, but his family's likes. He prefers good wine to scotch."
    }, {
        characterId: "goldenRetreiver",
        name: "Namek",
        description: "She was born of the best breed of Golden Retreivers, yet, she was born with one eye. Although no one pays attention to her lisp when she has only one eye, which is nice."
    }, {
        characterId: "wolf",
        name: "Nat Wolfi",
        description: "In love with Foxy, but she just plays games with him. No, not video games, and not even mobile games. Real life games - relationship wise."
    }, {
        characterId: "chowchow",
        name: "Morzsi San",
        description: "A rare hungarian puli - chowchow crossbreed. However, he does not have any special abilities, which is sad."
    }];

    var qs = $location.search();

    $scope.nameEdited = qs.name || false;
    $scope.urlEdited = qs.gameId || false;
    $scope.name = qs.name || "Enter your name here";
    $scope.url = qs.gameId || "Paste a game's URL or CODE here";

    $scope.nameClicked = function () {
        $scope.nameEdited = true;
        $scope.name = "";
    }

    $scope.urlClicked = function () {
        if ($scope.urlEdited) return;
        $scope.urlEdited = true;
        $scope.url = "";
    }

    $scope.select = function (id) {
        $scope.character = $scope.characters.filter(function (e) { return e.characterId == id })[0];
        $("#descriptionBox").slideDown();
    }
    if (qs.character) {
        $scope.select(qs.character);
    }

    $scope.join = function () {
        var url = $scope.url;
        if (url.indexOf("play/") > -1) url = url.split("play/")[1];

        var form = $("#loginForm");
        form.attr("action", "/play/" + url);
        form.submit();
    }

    $scope.create = function () {
        var form = $("#loginForm");
        $.get("/createRoom", function (response) {
            var url = response.url;
            form.attr("action", "/play/" + url);
            form.submit();
        });
    }
});


var playModule = angular.module("playModule", []);

playModule.run(function ($rootScope) {
    $rootScope.socket = window.socket;
    $rootScope.game = window.game;

    $rootScope.messages = [];

    $rootScope.playerName = $rootScope.game.parameters.gameParameters.name;
    $rootScope.character = $rootScope.game.parameters.gameParameters.character;
    $rootScope.player = {
        points: 0
    };
    $rootScope.enemy = {
        points: 0
    };

    $rootScope.socket.on("readyStateChanged", function (info) {
        var r = info.isReady;
        var n = info.name;
        var c = $rootScope.playerName == n ? $rootScope.player : $rootScope.enemy;
        c.isReady = r;

        $rootScope.$apply();
    });

    $rootScope.socket.on("startGame", function (x) {
        var timeout = x.timeout;
        var startTime = Date.now() + timeout;

        $("#doormat").addClass("hide");
        setTimeout(function () { $("#doormat").css("display", "none"); }, 1000);

        var countdownMessage = {
            klass: "show",
            text: "Starting in " + Math.floor(timeout / 1000) + "s!"
        }
        $rootScope.messages.push(countdownMessage);
        $rootScope.$apply();

        var interval = setInterval(function () {
            countdownMessage.text = "Starting in " + Math.round((startTime - Date.now()) / 1000) + "s!";
            $rootScope.$apply();
        }, 1000);

        setTimeout(function () {
            clearInterval(interval);
            countdownMessage.text = "GO!";
            countdownMessage.klass = "hide";
            $rootScope.$apply();
            setTimeout(function () {
                $rootScope.messages.splice($rootScope.messages.indexOf(countdownMessage), 1);
                $rootScope.$apply();
            }, 1000);
        }, timeout - 200);
    });

    $rootScope.socket.on("gameOver", function (gameOverInfo) {
        $rootScope.messages.length = 0;
        var gameOverMessage = {
            text: "Game Over",
            klass: "show"
        };
        var winnerMessage = {
            text: "You " + (gameOverInfo.winner == $rootScope.playerName ? "win!" : "lose..."),
            klass: (gameOverInfo.winner == $rootScope.playerName) ? "ready" : "notReady"
        };
        $rootScope.messages.push(gameOverMessage);
        $rootScope.messages.push(winnerMessage);
        $rootScope.$apply();
    });

    window.onmessage = function (evt) {
        if (evt.data.playerInfo) {
            var playerInfo = evt.data.playerInfo;
            if (playerInfo.playerType == "player") {
                $rootScope.player.name = playerInfo.name;
                $rootScope.player.character = playerInfo.character;
            } else {
                $rootScope.enemy.name = playerInfo.name;
                $rootScope.enemy.character = playerInfo.character;
            }
            $rootScope.$apply();
        } else if (evt.data.playerDied) {
            var deathMessage = {
                text: "You died",
                klass: "notReady"
            };
            var waitMessage = {
                text: "Waiting for opponent...",
                klass: "show"
            };
            $rootScope.messages.length = 0;
            $rootScope.messages.push(deathMessage, waitMessage);
            $rootScope.$apply();
        }
    }

    //delete window.socket;
    //delete window.game;
});

playModule.controller("doormatController", function ($rootScope, $scope) {

    $scope.readyButtonCaption = "I'm ready!";

    $scope.readyButtonClick = function () {
        if ($scope.readyButtonCaption == "I'm ready!") {
            $scope.readyButtonCaption = "Wait, not ready!";
            $rootScope.socket.emit("readyStateChanged", {
                isReady: true,
                name: $rootScope.playerName,
                timestamp: Date.now()
            });
        } else {
            $scope.readyButtonCaption = "I'm ready!";
            $rootScope.socket.emit("readyStateChanged", {
                isReady: false,
                name: $rootScope.playerName,
                timestamp: Date.now()
            });
        }
    };

    $scope.gameUrl = window.location.href;

});

playModule.controller("pointsController", function ($rootScope, $scope) {
    $rootScope.socket.on("pointUpdate", function (x) {
        var c = (x.name == $rootScope.player.name) ? $rootScope.player : $rootScope.enemy;
        c.points = x.points;
        $rootScope.$apply();
    });
});