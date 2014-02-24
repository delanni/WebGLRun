/// <reference path="references.ts" />

module GAME {
	export class Game {
		gameWorld:any;
		engine:any;
		scene:any;
		camera:any;
		canvas: any;
		items: {[name:string]:any};

		constructor(){
			this.gameWorld = new BABYLON.GameFX.GameWorld("mainCanvas", "hard");
			this.engine = this.gameWorld.engine;
			this.scene = this.gameWorld.scene;
			this.camera = this.gameWorld.camera;
			this.canvas = this.gameWorld.canvas;

			this.items = {};
			this.items["box1"] = BABYLON.Mesh.CreateBox("box1", 5,this.scene);
			this.items["box1"].material = new BABYLON.StandardMaterial("m1",this.scene);
			this.items["light1"] = new BABYLON.PointLight("light1", new BABYLON.Vector3(10,100,10), this.scene);

			this.camera.attachControl(this.canvas);
		}

		init(){
			this.gameWorld.startGameLoop(this.animate);
		}

		private animate(){
			this.items["box1"].rotation.x+=0.01;
		}

	}
}