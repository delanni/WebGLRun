var BABYLON;
(function (BABYLON) {
    var SceneLoader = (function () {
        function SceneLoader() {
        }
        // Methods
        SceneLoader._GetPluginForFilename = function (sceneFilename) {
            var dotPosition = sceneFilename.lastIndexOf(".");
            var extension = sceneFilename.substring(dotPosition).toLowerCase();

            for (var index = 0; index < this._registeredPlugins.length; index++) {
                var plugin = this._registeredPlugins[index];

                if (plugin.extensions.indexOf(extension) !== -1) {
                    return plugin;
                }
            }

            throw new Error("No plugin found to load this file: " + sceneFilename);
        };

        // Public functions
        SceneLoader.RegisterPlugin = function (plugin) {
            plugin.extensions = plugin.extensions.toLowerCase();
            SceneLoader._registeredPlugins.push(plugin);
        };

        SceneLoader.ImportMesh = function (meshesNames, rootUrl, sceneFilename, scene, onsuccess, progressCallBack, onerror) {
            // Checking if a manifest file has been set for this scene and if offline mode has been requested
            var database = null;
            scene.database = database;

            var plugin = SceneLoader._GetPluginForFilename(sceneFilename);

            BABYLON.Tools.LoadFile(rootUrl + sceneFilename, function (data) {
                var meshes = [];
                var particleSystems = [];
                var skeletons = [];

                if (!plugin.importMesh(meshesNames, scene, data, rootUrl, meshes, particleSystems, skeletons)) {
                    if (onerror) {
                        onerror(scene);
                    }

                    return;
                }

                if (onsuccess) {
                    onsuccess(meshes, particleSystems, skeletons);
                }
            }, progressCallBack, database);
        };

        SceneLoader.Load = function (rootUrl, sceneFilename, engine, onsuccess, progressCallBack, onerror) {
            var plugin = SceneLoader._GetPluginForFilename(sceneFilename.name || sceneFilename);
            var database = null;

            var loadSceneFromData = function (data) {
                var scene = new BABYLON.Scene(engine);
                scene.database = database;

                if (!plugin.load(scene, data, rootUrl)) {
                    if (onerror) {
                        onerror(scene);
                    }

                    return;
                }

                if (onsuccess) {
                    onsuccess(scene);
                }
            };

            if (rootUrl.indexOf("file:") === -1) {
                // Checking if a manifest file has been set for this scene and if offline mode has been requested
                database = null; //new BABYLON.Database(rootUrl + sceneFilename);

                BABYLON.Tools.LoadFile(rootUrl + sceneFilename, loadSceneFromData, progressCallBack, null);
            } else {
                BABYLON.Tools.ReadFile(sceneFilename, loadSceneFromData, progressCallBack);
            }
        };
        SceneLoader._registeredPlugins = new Array();
        return SceneLoader;
    })();
    BABYLON.SceneLoader = SceneLoader;
})(BABYLON || (BABYLON = {}));
