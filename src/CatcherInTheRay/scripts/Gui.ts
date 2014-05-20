declare module dat {
    class GUI { }
}

interface GameProperties {
    _sceneId: GAME.Scenes;
    _gameParameters: GAME.SCENES.GameParameters;
    _mapParameters: TERRAIN.LandscapeGeneratorParameters;
}

class GUI {
    private _gameWorld: GAME.GameWorld;
    private _gui: any;

    public properties: GameProperties;

    constructor(gameWorld: GAME.GameWorld) {
        if (typeof gameWorld !== 'undefined') {
            this.AttachTo(gameWorld);
        }
    }

    public Reload() {
        this._gameWorld.applyGuiParams(this.properties);
        this._gameWorld.loadScene(this.properties._sceneId);
    }


    public AttachTo(gameWorld: GAME.GameWorld) {
        this._gameWorld = gameWorld;

        this.setDefaults(this._gameWorld._defaults);
        this.initialize();
    }

    private setDefaults(defaults: GameProperties) {
        this.properties = defaults;
    }

    private initialize() {
        this._gui = new dat.GUI();

        var sceneFolder = this._gui.addFolder("Scenes");
        sceneFolder.add(this.properties, "_sceneId", { "Test": GAME.Scenes.TEST, "Game": GAME.Scenes.GAME }).name("Scene")
            .onChange((x) => this.properties._sceneId = +x);
        sceneFolder.open();

        var gameFolder = this._gui.addFolder("Game Map");
        var flatShadingCtr = gameFolder.add(this.properties._gameParameters, "useFlatShading").name("Use flat shading");
        gameFolder.open();

        var terrainGenFolder = this._gui.addFolder("Terrain and landscape");
        var widthCtr = terrainGenFolder.add(this.properties._mapParameters, "width").name("Map width").min(160).max(2000).step(10);
        terrainGenFolder.add(this.properties._mapParameters, "height").name("Map height").min(160).max(6000).step(10);
        terrainGenFolder.add(this.properties._mapParameters, "destructionLevel").name("Destruction level").min(0).max(20).step(1);
        terrainGenFolder.add(this.properties._mapParameters, "displayCanvas").name("Display debug canvases");
        var pathTopCtr = terrainGenFolder.add(this.properties._mapParameters, "pathTopOffset").name("Path top offset").min(0).step(1).max(widthCtr.getValue());
        var pathBottomCtr = terrainGenFolder.add(this.properties._mapParameters, "pathBottomOffset").name("Path bottom offset").min(0).step(1).max(widthCtr.getValue());
        terrainGenFolder.add(this.properties._mapParameters, "minHeight").name("Minimum height of the map").min(0).max(100).step(5);
        terrainGenFolder.add(this.properties._mapParameters, "maxHeight").name("Maximum height of the map").min(100).max(500).step(5);

        var submeshCtr = terrainGenFolder.add(this.properties._mapParameters, "submesh").name("Number of submeshes").min(1).max(300).step(1);
        flatShadingCtr.onChange(x=> {
            submeshCtr.max(x ? 100 : 300);
            submeshCtr.setValue(Math.min(this.properties._mapParameters.submesh, 100));
        });

        widthCtr.onChange(x=> {
            pathBottomCtr.setValue(Math.min(x,pathBottomCtr.getValue())).max(x);
            pathTopCtr.setValue(Math.min(x, pathTopCtr.getValue())).max(x);
        });
        
        terrainGenFolder.add(this.properties._mapParameters, "param").name("Perlin-Noise parameter").min(1.0).max(3.0).step(0.1);
        terrainGenFolder.open();

        this._gui.add(this, "Reload").name("<b>RELOAD</b>");
    }

}