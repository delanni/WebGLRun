var GAME = {};

(function(GAME){
	GAME.gameWorld = new BABYLON.GameFX.GameWorld("mainCanvas","hard");

	GAME.box = BABYLON.Mesh.CreateBox("Box1", 5, GAME.gameWorld.scene);
	GAME.box.material = new BABYLON.StandardMaterial("m1", GAME.gameWorld.scene);
	
	GAME.light = new BABYLON.PointLight("l1", new BABYLON.Vector3(10.0,100.0,10.0), GAME.gameWorld.scene);

	GAME.gameWorld.camera.attachControl(GAME.gameWorld.canvas);

	var f = function(){
		GAME.box.rotation.x+=0.01;
	}

	GAME.gameWorld.startGameLoop(f);

})(GAME || {});	

console.log(GAME);