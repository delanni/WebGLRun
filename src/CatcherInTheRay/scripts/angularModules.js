var rr = angular.module("rr", []);

rr.controller("loginController", function ($scope,$location) {
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
        name: "Ray Wolfian Jorma",
        description: "In love with Foxy, but she just plays games with him. No, not video games, and not even mobile games. Real life games - relationship wise."
    }, {
        characterId: "chowchow",
        name: "Morzsi San",
        description: "A rare hungarian puli - chowchow crossbreed. However, he does not have any special abilities, which is sad."
    }];

    var qs = $location.search();

    $scope.nameEdited = qs.name || false;
    $scope.urlEdited = qs.gameId || false;
    $scope.name = qs.name || "Your name here";
    $scope.url = qs.gameId || "Paste a game's URL or CODE here";

    $scope.nameClicked = function () {
        $scope.nameEdited = true;
        $scope.name = "";
    }

    $scope.urlClicked = function () {
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