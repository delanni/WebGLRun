if (typeof BABYLON !== 'undefined') {
    if (typeof BABYLON.Mesh !== 'undefined') {
        BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas = function (name, canvas, width, height, subdivisions, minHeight, maxHeight, scene, updatable) {
            var groundBase = BABYLON.Mesh.CreateGround(name, width, height, subdivisions, scene, updatable);
            var context = canvas.getContext("2d");
            var canvasBuffer = context.getImageData(0, 0, canvas.width, canvas.height);
            var vertexData = Cast(BABYLON.VertexData).CreateGroundFromHeightMap(width, height, subdivisions, minHeight, maxHeight, canvasBuffer.data, canvasBuffer.width, canvasBuffer.height);
            vertexData.applyToMesh(groundBase, updatable);
            return groundBase;
        };
    }
}
var FILTERS;
(function (FILTERS) {
    var StackBlurFilter = (function () {
        function StackBlurFilter(radius, customRect) {
            if (customRect) {
                this._fullCanvas = false;
                this._customRect = customRect;
            }
            else {
                this._fullCanvas = true;
            }
            this._useAlpha = true;
            this._radius = radius;
        }
        StackBlurFilter.prototype.Check = function (canvas) {
            return true;
        };
        StackBlurFilter.prototype.Apply = function (canvas) {
            if (this._fullCanvas) {
                if (!this._useAlpha) {
                    BLUR.stackBlurCanvasRGBFromCanvas(canvas, 0, 0, canvas.width, canvas.height, this._radius);
                }
                else {
                    BLUR.stackBlurCanvasRGBAFromCanvas(canvas, 0, 0, canvas.width, canvas.height, this._radius);
                }
            }
            else {
                if (!this._useAlpha) {
                    BLUR.stackBlurCanvasRGBFromCanvas(canvas, this._customRect.x, this._customRect.y, this._customRect.width, this._customRect.height, this._radius);
                }
                else {
                    BLUR.stackBlurCanvasRGBAFromCanvas(canvas, this._customRect.x, this._customRect.y, this._customRect.width, this._customRect.height, this._radius);
                }
            }
            return canvas;
        };
        return StackBlurFilter;
    })();
    FILTERS.StackBlurFilter = StackBlurFilter;
    function Upscale(canvas, targetWidth, targetHeight) {
        var upscaled = CreateCanvas(targetWidth, targetHeight, false);
        var upscaledCtx = upscaled.getContext("2d");
        var originalContext = canvas.getContext("2d");
        var originalImgData = originalContext.getImageData(0, 0, canvas.width, canvas.height);
        upscaledCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetWidth, targetHeight);
        return upscaled;
    }
    FILTERS.Upscale = Upscale;
})(FILTERS || (FILTERS = {}));
var FILTERS;
(function (FILTERS) {
    var CopyOverwriteFilter = (function () {
        function CopyOverwriteFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        CopyOverwriteFilter.prototype.Check = function (canvas) {
            return true;
        };
        CopyOverwriteFilter.prototype.Apply = function (canvas) {
            var targetCtx = canvas.getContext("2d");
            targetCtx.drawImage(this._paramCanvas, 0, 0, canvas.width, canvas.height);
            return canvas;
        };
        return CopyOverwriteFilter;
    })();
    FILTERS.CopyOverwriteFilter = CopyOverwriteFilter;
    var AdditiveCopyFilter = (function () {
        function AdditiveCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        AdditiveCopyFilter.prototype.Check = function (canvas) {
            return true;
        };
        AdditiveCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;
            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);
            for (var ix = 0; ix < paramPixels.length; ix++) {
                targetImgData.data[ix] = Math.min((targetImgData.data[ix] + paramPixels[ix]), 255) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);
            return canvas;
        };
        return AdditiveCopyFilter;
    })();
    FILTERS.AdditiveCopyFilter = AdditiveCopyFilter;
    var InverseAdditiveCopyFilter = (function () {
        function InverseAdditiveCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        InverseAdditiveCopyFilter.prototype.Check = function (canvas) {
            return true;
        };
        InverseAdditiveCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;
            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);
            for (var ix = 0; ix < paramPixels.length; ix++) {
                targetImgData.data[ix] = Math.min((targetImgData.data[ix] + (255 - paramPixels[ix])), 255) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);
            return canvas;
        };
        return InverseAdditiveCopyFilter;
    })();
    FILTERS.InverseAdditiveCopyFilter = InverseAdditiveCopyFilter;
    var SubstractiveCopyFilter = (function () {
        function SubstractiveCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        SubstractiveCopyFilter.prototype.Check = function (canvas) {
            return true;
        };
        SubstractiveCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;
            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);
            for (var ix = 0; ix < paramPixels.length; ix++) {
                if (ix % 4 == 3)
                    continue;
                targetImgData.data[ix] = Math.max((targetImgData.data[ix] - paramPixels[ix]), 0) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);
            return canvas;
        };
        return SubstractiveCopyFilter;
    })();
    FILTERS.SubstractiveCopyFilter = SubstractiveCopyFilter;
    var DarknessCopyFilter = (function () {
        function DarknessCopyFilter(paramCanvas) {
            this._paramCanvas = paramCanvas;
        }
        DarknessCopyFilter.prototype.Check = function (canvas) {
            return true;
        };
        DarknessCopyFilter.prototype.Apply = function (canvas) {
            var paramCtx = this._paramCanvas.getContext("2d");
            var paramPixels = paramCtx.getImageData(0, 0, this._paramCanvas.width, this._paramCanvas.height).data;
            var targetCtx = canvas.getContext("2d");
            var targetImgData = targetCtx.getImageData(0, 0, canvas.width, canvas.height);
            for (var ix = 0; ix < paramPixels.length; ix++) {
                if (ix % 4 == 3)
                    continue;
                targetImgData.data[ix] = Math.max((targetImgData.data[ix] - (255 - paramPixels[ix])), 0) | 0;
            }
            targetCtx.putImageData(targetImgData, 0, 0);
            return canvas;
        };
        return DarknessCopyFilter;
    })();
    FILTERS.DarknessCopyFilter = DarknessCopyFilter;
    var BleedFeed = (function () {
        function BleedFeed(paramCanvas, blurRadius, iterations, darkfeed) {
            if (darkfeed === void 0) { darkfeed = false; }
            this._paramCanvas = paramCanvas;
            this._isDarkFeed = darkfeed;
            this._blurriness = blurRadius;
            this._iterations = iterations;
        }
        BleedFeed.prototype.Check = function (canvas) {
            return true;
        };
        BleedFeed.prototype.Apply = function (canvas) {
            var backup = document.createElement("canvas");
            backup.width = canvas.width;
            backup.height = canvas.height;
            var copyFilter = new FILTERS.CopyOverwriteFilter(canvas);
            copyFilter.Apply(backup);
            var blurFilter = new FILTERS.StackBlurFilter(this._blurriness);
            var darkFeedback = new FILTERS.DarknessCopyFilter(backup);
            var lightFeedback = new FILTERS.AdditiveCopyFilter(backup);
            for (var i = 0; i < this._iterations; i++) {
                blurFilter.Apply(canvas);
                if (this._isDarkFeed) {
                    darkFeedback.Apply(canvas);
                }
                else {
                    lightFeedback.Apply(canvas);
                }
            }
            return canvas;
        };
        return BleedFeed;
    })();
    FILTERS.BleedFeed = BleedFeed;
})(FILTERS || (FILTERS = {}));
var FILTERS;
(function (FILTERS) {
    var HistogramEqFilter = (function () {
        function HistogramEqFilter(from, to, eqFactor) {
            if (eqFactor === void 0) { eqFactor = 1; }
            this._eqFactor = eqFactor;
            this._from = from;
            this._to = to;
        }
        HistogramEqFilter.prototype.Check = function (canvas) {
            return true;
        };
        HistogramEqFilter.prototype.Apply = function (canvas) {
            var maxGradient = 0;
            var minGradient = 0;
            var ctx = canvas.getContext("2d");
            var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < img.data.length; i += 4) {
                var r = img.data[i] / 255.0;
                var g = img.data[i + 1] / 255.0;
                var b = img.data[i + 2] / 255.0;
                var gradient = r * 0.3 + g * 0.59 + b * 0.11;
                maxGradient = Math.max(gradient, maxGradient);
                minGradient = Math.min(gradient, minGradient);
            }
            var gradientRange = maxGradient - minGradient;
            var targetRange = this._to - this._from;
            for (var i = 0; i < img.data.length; i += 4) {
                var r = img.data[i] / 255.0;
                var g = img.data[i + 1] / 255.0;
                var b = img.data[i + 2] / 255.0;
                var gradient = r * 0.3 + g * 0.59 + b * 0.11;
                var normalized = Math.pow((gradient - minGradient) / gradientRange, this._eqFactor) * targetRange + this._from;
                img.data[i] = (normalized * 255) | 0;
                img.data[i + 1] = (normalized * 255) | 0;
                img.data[i + 2] = (normalized * 255) | 0;
            }
            ctx.putImageData(img, 0, 0);
            return canvas;
        };
        return HistogramEqFilter;
    })();
    FILTERS.HistogramEqFilter = HistogramEqFilter;
})(FILTERS || (FILTERS = {}));
var GAME;
(function (GAME) {
    GAME.MODEL_ANIMATIONS = {
        "fox": {
            RUN: {
                start: 1,
                end: 11,
                speed: 14,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 5,
                end: 9,
                speed: 16,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.25, 0.25, 0.25])
        },
        "wolf": {
            RUN: {
                start: 1,
                end: 14,
                speed: 16,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 5,
                end: 11,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.20, 0.20, 0.20])
        },
        "moose": {
            RUN: {
                start: 1,
                end: 15,
                speed: 12,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 7,
                end: 11,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.10, 0.10, 0.10])
        },
        "deer": {
            RUN: {
                start: 1,
                end: 16,
                speed: 16,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 1,
                end: 11,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.15, 0.15, 0.15])
        },
        "elk": {
            RUN: {
                start: 1,
                end: 15,
                speed: 12,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 1,
                end: 4,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.25, 0.25, 0.25])
        },
        "mountainlion": {
            RUN: {
                start: 1,
                end: 13,
                speed: 16,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 1,
                end: 5,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.15, 0.15, 0.15])
        },
        "chowchow": {
            RUN: {
                start: 1,
                end: 13,
                speed: 16,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 5,
                end: 10,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.25, 0.25, 0.25])
        },
        "goldenRetreiver": {
            RUN: {
                start: 1,
                end: 12,
                speed: 16,
                repeat: true
            },
            STAY: {
                start: 0,
                end: 1,
                speed: 0,
                repeat: false
            },
            JUMP: {
                start: 2,
                end: 7,
                speed: 14,
                repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.17, 0.17, 0.17])
        }
    };
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    var SCENES;
    (function (SCENES) {
        var SceneBuilder = (function () {
            function SceneBuilder(gameWorld) {
                this._gameWorld = gameWorld;
            }
            SceneBuilder.prototype.BuildScene = function () {
                this._scene = new BABYLON.Scene(this._gameWorld._engine);
                return this.BuildSceneAround(this._scene);
            };
            SceneBuilder.prototype.BuildSceneAround = function (scene) {
                throw new Error('This method is abstract');
            };
            SceneBuilder.prototype.SetParameters = function (params) {
                throw new Error('This method is abstract');
            };
            return SceneBuilder;
        })();
        SCENES.SceneBuilder = SceneBuilder;
    })(SCENES = GAME.SCENES || (GAME.SCENES = {}));
})(GAME || (GAME = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GAME;
(function (GAME) {
    var SCENES;
    (function (SCENES) {
        var TestScene = (function (_super) {
            __extends(TestScene, _super);
            function TestScene(gameWorld) {
                _super.call(this, gameWorld);
            }
            TestScene.prototype.BuildSceneAround = function (scene) {
                var torusKnot;
                var light = new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
                var camera = new BABYLON.ArcRotateCamera("Camera", 10, 20, 30, new BABYLON.Vector3(0, 0, 0), scene);
                camera.attachControl(this._gameWorld._canvas);
                torusKnot = BABYLON.Mesh.CreateTorusKnot("torusknot", 3, 2, 80, 30, 4, 4, scene, true);
                scene.registerBeforeRender(function () {
                    torusKnot.rotate(BABYLON.Vector3.Up(), 0.01, 0 /* LOCAL */);
                });
                return scene;
            };
            return TestScene;
        })(GAME.SCENES.SceneBuilder);
        SCENES.TestScene = TestScene;
    })(SCENES = GAME.SCENES || (GAME.SCENES = {}));
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    var SCENES;
    (function (SCENES) {
        var GameScene = (function (_super) {
            __extends(GameScene, _super);
            function GameScene(gameWorld, parameters, mapParameters) {
                this._debug = parameters.debug || false;
                this._useFlatShading = parameters.useFlatShading || false;
                this._character = parameters.character;
                this._mapParams = mapParameters;
                this.followPlayer = true;
                _super.call(this, gameWorld);
            }
            GameScene.prototype.addLightsAndCamera = function () {
                var scene = this._scene;
                this._gameWorld._lights = [];
                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;
                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;
                this._gameWorld._lights.push(antiLight);
                this._gameWorld._lights.push(light);
                this.mainCamera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 1000, 0), scene);
                this.mainCamera.maxZ = 10000;
                this.mainCamera.speed = 8;
            };
            GameScene.prototype.addSkyDome = function () {
                var scene = this._scene;
                var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
                skybox.rotation.y = 1.2;
                var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
                skyboxMaterial.backFaceCulling = false;
                skybox.material = skyboxMaterial;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.reflectionTexture = Cast(new BABYLON.CubeTexture("/assets/Skybox/skyrender", scene, ["0006.png", "0002.png", "0001.png", "0003.png", "0005.png", "0004.png"]));
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skybox.checkCollisions = false;
            };
            GameScene.prototype.generateLandscape = function () {
                var scene = this._scene;
                var heightMapGenerator = new TERRAIN.HeightMapGenerator(this._mapParams);
                var noise = heightMapGenerator.GenerateHeightMap();
                var terrainGenerator = new TERRAIN.TerrainGenerator(this._mapParams);
                Trace("Mesh from height map");
                var mountainMesh = terrainGenerator.ConvertNoiseToBabylonMesh(noise, scene);
                mountainMesh.name = "MountainMesh";
                Trace("Mesh from height map");
                Trace("Generating sides");
                var wrappingMesh = terrainGenerator.GenerateWrappingMesh(mountainMesh, scene);
                Trace("Generating sides");
                Trace("Colorize mesh");
                terrainGenerator.ColorizeMesh(mountainMesh);
                Trace("Colorize mesh");
                if (this._useFlatShading) {
                    mountainMesh.material = this._flatShader;
                }
                else {
                    var mountainMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                    mountainMesh.material = mountainMaterial;
                    mountainMaterial.specularPower = 0;
                    mountainMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                }
                mountainMesh.checkCollisions = true;
                mountainMesh.subdivide(Cast(mountainMesh).subdivisions);
                mountainMesh.createOrUpdateSubmeshesOctree();
                this.mountains = mountainMesh;
                this.mountains.material.wireframe = false;
                var mountainSideMaterial = new BABYLON.StandardMaterial("mountainSideMaterial", scene);
                wrappingMesh.material = mountainSideMaterial;
                mountainSideMaterial.specularPower = 0;
                mountainSideMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                mountainSideMaterial.diffuseColor = new BABYLON.Color3(0.43, 0.29, 0.03);
                mountainSideMaterial.bumpTexture = new BABYLON.Texture("/assets/noisenormals.jpg", scene);
            };
            GameScene.prototype.putStartAndEnd = function () {
                var scene = this._scene;
                this.startOrb = BABYLON.Mesh.CreateSphere("startOrb", 30, 30, scene, true);
                this.startOrb.material = new BABYLON.StandardMaterial("startOrbMat", scene);
                Cast(this.startOrb.material).emissiveColor = new BABYLON.Color3(0.3, 1.0, 0.2);
                this.endOrb = BABYLON.Mesh.CreateSphere("endOrb", 30, 30, scene, true);
                this.endOrb.material = new BABYLON.StandardMaterial("endOrbMat", scene);
                Cast(this.endOrb.material).emissiveColor = new BABYLON.Color3(1.0, 0.2, 0.3);
                this.startOrb.position = new BABYLON.Vector3(this._mapParams.pathTopOffset - this._mapParams.width / 2, 60, this._mapParams.height / 2 - 10);
                this.endOrb.position = new BABYLON.Vector3(this._mapParams.pathBottomOffset - this._mapParams.width / 2, 20, this._mapParams.height / -2 + 10);
            };
            GameScene.prototype.CreatePlayer = function (meshName) {
                var _this = this;
                var scene = this._scene;
                var playerMesh;
                this.player = new GAME.Player(scene, this.mountains);
                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, function (x) {
                    playerMesh = Cast(x[0]);
                    playerMesh.material = _this._flatShader;
                    playerMesh.position = new BABYLON.Vector3(0, -5, 0);
                    playerMesh.rotate(BABYLON.Axis.Y, Math.PI, 0 /* LOCAL */);
                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    playerMesh.parent = parent;
                    parent.position = _this.startOrb.position.clone();
                    parent.position.x += _this._gameWorld.parameters.gameParameters.isHost ? 20 : -20;
                    var cameraFollowTarget = BABYLON.Mesh.CreateSphere("fakeKid", 30, 2, scene, false);
                    cameraFollowTarget.material = new BABYLON.StandardMaterial("fakeMat", scene);
                    cameraFollowTarget.isVisible = false;
                    cameraFollowTarget.position = parent.position.clone();
                    _this.player.Initialize(playerMesh);
                    scene.registerBeforeRender(function () {
                        if (_this.followPlayer && !_this.mainCamera.target) {
                            _this.mainCamera.radius = 150;
                            _this.mainCamera.heightOffset = 30;
                            _this.mainCamera.rotationOffset = 0;
                            _this.mainCamera.cameraAcceleration = 0.05;
                            _this.mainCamera.maxCameraSpeed = 4;
                            _this.mainCamera.target = cameraFollowTarget;
                            _this.mainCamera.setTarget(cameraFollowTarget.position);
                        }
                        else if (_this.mainCamera.target) {
                            var moveTarget = parent.position.subtract(cameraFollowTarget.position);
                            moveTarget.scaleInPlace(0.15);
                            cameraFollowTarget.position.addInPlace(moveTarget);
                            _this.mainCamera.rotationOffset = UTILS.Clamp((_this.player.CurrentRotation % Math.PI) / Math.PI * 180, -45, 45);
                        }
                    });
                });
                return this.player;
            };
            GameScene.prototype.CreateEnemy = function (meshName) {
                var _this = this;
                var scene = this._scene;
                var enemyMesh;
                this.enemy = new GAME.Player(scene, this.mountains);
                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, function (x) {
                    enemyMesh = Cast(x[0]);
                    enemyMesh.material = _this._flatShader;
                    enemyMesh.position = new BABYLON.Vector3(0, -5, 0);
                    enemyMesh.rotate(BABYLON.Axis.Y, Math.PI, 0 /* LOCAL */);
                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    enemyMesh.parent = parent;
                    parent.position = _this.startOrb.position.clone();
                    parent.position.x += _this._gameWorld.parameters.gameParameters.isHost ? -20 : 20;
                    _this.enemy.Initialize(enemyMesh);
                });
                return this.enemy;
            };
            GameScene.prototype.createFlatShader = function () {
                var scene = this._scene;
                var flatShader = new BABYLON.ShaderMaterial("flatShader", scene, "flat", {
                    attributes: ["position", "normal", "uv", "color"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                });
                var camera = scene.activeCamera;
                flatShader.setVector3("cameraPosition", camera.position);
                for (var i = 0; i < scene.lights.length; i++) {
                    var light = Cast(scene.lights[i]);
                    if (!(light instanceof BABYLON.PointLight))
                        continue;
                    flatShader.setVector3("light" + (i + 1) + "Position", light.position);
                    var colors = BABYLON.Vector3.FromArray(light.diffuse.asArray());
                    flatShader.setVector3("light" + (i + 1) + "Color", colors);
                }
                this._flatShader = flatShader;
            };
            GameScene.prototype.BuildSceneAround = function (scene) {
                this.addLightsAndCamera();
                this.createFlatShader();
                this.addSkyDome();
                this.generateLandscape();
                this.putStartAndEnd();
                this.CreatePlayer(this._character);
                return scene;
            };
            return GameScene;
        })(SCENES.SceneBuilder);
        SCENES.GameScene = GameScene;
    })(SCENES = GAME.SCENES || (GAME.SCENES = {}));
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    GAME.ACCEPTED_KEYS = { "32": 32, "87": 87, "68": 68, "83": 83, "65": 65, "82": 82 };
    var GameWorld = (function () {
        function GameWorld(canvasId, parameters, socket, fullify) {
            this._scenes = {};
            this.random = new MersenneTwister(111);
            this.parameters = {
                sceneId: 2 /* GAME */,
                gameParameters: {
                    useFlatShading: false,
                    name: ["Bill", "Jeff", "Jorma", "Teddy", "Eilene", "Georgie"][Math.floor(Math.random() * 6)],
                    character: ["elk", "fox", "chowchow", "deer", "wolf", "mountainlion"][Math.floor(Math.random() * 6)],
                    isHost: false
                },
                mapParameters: {
                    randomSeed: 111,
                    destructionLevel: 13,
                    displayCanvas: false,
                    height: 1500,
                    width: 600,
                    minHeight: 0,
                    maxHeight: 300,
                    subdivisions: 200,
                    random: this.random,
                    param: 1.1,
                    pathBottomOffset: 300,
                    pathTopOffset: 300,
                    shrink: 1.7,
                    eqFactor: 1
                }
            };
            this._lastPositionUpdate = 0;
            BABYLON.Engine.ShadersRepository = "/scripts/Shaders/";
            this._socket = socket;
            this._canvas = Cast(document.getElementById(canvasId));
            this._engine = new BABYLON.Engine(this._canvas);
            if (fullify) {
                this.extendCanvas(2 /* HARD */);
            }
            if (!parameters || !(parameters instanceof Object)) {
                this._gui = new GUI(this);
            }
            else {
                UTILS.Mixin(parameters, this.parameters, false);
            }
            this.appendHandlers(this._socket);
        }
        GameWorld.prototype.Load = function (properties) {
            var _this = this;
            properties = UTILS.Mixin(properties, this.parameters, false);
            var random = new MersenneTwister(properties.mapParameters.randomSeed);
            properties.mapParameters.random = random;
            this._engine.displayLoadingUI().then(function () {
                _this.applyParameters(properties);
                _this.loadScene(properties.sceneId);
                if (_this.parameters.gameParameters.isHost) {
                    var c = document.getElementById("mainNoiseCanvas");
                    var dataurl = c.toDataURL();
                    _this._socket.emit("mapLoaded", { timestamp: Date.now(), heightmap: dataurl });
                }
                else {
                    _this._socket.emit("mapLoaded", { timestamp: Date.now() });
                }
                _this._engine.hideLoadingUI();
                _this.hookKeyboardTo(_this.sceneBuilder.player.Controller);
                _this.player = _this.sceneBuilder.player;
            });
        };
        GameWorld.prototype.hookSocketTo = function (controller) {
            var socket = this._socket;
            socket.on("keydown", function (evt) {
                if (evt.keyCode in GAME.ACCEPTED_KEYS) {
                    if (controller[evt.keyCode] === 0) {
                        controller[evt.keyCode] = 1;
                    }
                }
            });
            socket.on("keyup", function (evt) {
                if (evt.keyCode in GAME.ACCEPTED_KEYS) {
                    controller[evt.keyCode] = 0;
                }
            });
        };
        GameWorld.prototype.hookKeyboardTo = function (controller) {
            var _this = this;
            window.addEventListener("keydown", function (evt) {
                if (evt.keyCode in GAME.ACCEPTED_KEYS) {
                    _this._socket.emit("keydown", { keyCode: evt.keyCode });
                    if (controller[evt.keyCode] === 0) {
                        controller[evt.keyCode] = 1;
                    }
                    evt.preventDefault();
                }
            });
            window.addEventListener("keyup", function (evt) {
                if (evt.keyCode in GAME.ACCEPTED_KEYS) {
                    _this._socket.emit("keyup", { keyCode: evt.keyCode });
                    controller[evt.keyCode] = 0;
                    evt.preventDefault();
                }
            });
        };
        GameWorld.prototype.appendHandlers = function (socket) {
            var _this = this;
            socket.on("welcome", function (x) {
                console.log("Successfully logged in at " + x.timestamp);
                socket.emit("gladICouldJoin", {
                    name: _this.parameters.gameParameters.name,
                    character: _this.parameters.gameParameters.character
                });
                window.postMessage({
                    playerInfo: { name: _this.parameters.gameParameters.name }
                }, window.location.href);
            });
            socket.on("playerJoined", function (playerInfo) {
                var enemy = _this.sceneBuilder.CreateEnemy(playerInfo.character);
                _this.hookSocketTo(enemy.Controller);
                _this.enemy = enemy;
                window.postMessage({
                    playerInfo: { name: playerInfo.name }
                }, window.location.href);
            });
            socket.on("enemyPositionUpdate", function (positionInfo) {
                _this.enemy.pushUpdate(positionInfo);
            });
            socket.on("ping", function (x) {
                socket.emit("pong", { timestamp: Date.now() });
            });
            socket.on("pong", function (x) {
                console.log("pong", x);
            });
            socket.on("startGame", function (x) {
                var timeout = x.timeout;
                setTimeout(function () {
                    _this.Start();
                }, timeout);
                setTimeout(function () {
                    _this.countdown(timeout);
                }, 0);
                _this.startRenderLoop();
            });
        };
        GameWorld.prototype.startRenderLoop = function () {
            var _this = this;
            this._scene.registerBeforeRender(function () {
                var now = Date.now();
                if (now - _this._lastPositionUpdate > 3000) {
                    _this._lastPositionUpdate = now;
                    _this._socket.emit("positionUpdate", [
                        _this.player.parent.position.asArray(),
                        _this.player.parent.rotationQuaternion.asArray(),
                        _this.player.velocity.asArray(),
                        now
                    ]);
                }
            });
            BABYLON.Tools.QueueNewFrame(function () { return _this.renderLoop(); });
        };
        GameWorld.prototype.Start = function () {
            console.info("Started!");
            this.player && this.player.SetEnabled(true);
            this.enemy && this.enemy.SetEnabled(true);
        };
        GameWorld.prototype.countdown = function (timeoutms) {
            var _this = this;
            console.info("Game starts in " + timeoutms / 1000 + "!");
            window.postMessage({
                timeoutms: timeoutms
            }, window.location.href);
            if (timeoutms >= 0) {
                setTimeout(function () {
                    _this.countdown(timeoutms - 1000);
                }, 1000);
            }
        };
        GameWorld.prototype.applyParameters = function (guiParams) {
            this.buildScenes(guiParams);
        };
        GameWorld.prototype.buildScenes = function (parameters) {
            switch (parameters.sceneId) {
                case 0 /* TEST */:
                    var testScene = new GAME.SCENES.TestScene(this);
                    this._scenes["TEST"] = testScene;
                    break;
                case 2 /* GAME */:
                    var gameScene = new GAME.SCENES.GameScene(this, parameters.gameParameters, parameters.mapParameters);
                    this.sceneBuilder = gameScene;
                    this._scenes["GAME"] = gameScene;
                    break;
                case 3 /* ANIMAL */:
                    var animalScene = new GAME.SCENES.AnimalScene(this);
                    this._scenes["ANIMAL"] = animalScene;
                    break;
                case 4 /* TERRAINGEN */:
                    var terrainGenScene = new GAME.SCENES.TerrainGenScene(this, parameters.gameParameters, parameters.mapParameters);
                    this._scenes["TERRAINGEN"] = terrainGenScene;
                    break;
            }
        };
        GameWorld.prototype.extendCanvas = function (fullify) {
            var _this = this;
            var parent = this._canvas.parentElement;
            if (fullify == 0 /* NO */)
                return;
            var resize = function () {
                if (fullify === 2 /* HARD */) {
                    _this._canvas.width = _this._canvas.parentElement.clientWidth;
                    _this._canvas.height = _this._canvas.parentElement.clientHeight;
                    _this._engine.resize();
                }
                else {
                    _this._canvas.style["width"] = "100%";
                    _this._canvas.style["height"] = "100%";
                }
            };
            window.onresize = resize;
            resize();
        };
        GameWorld.prototype.renderLoop = function () {
            var _this = this;
            this._engine.beginFrame();
            if (this._scene) {
                this._scene.render();
            }
            this._engine.endFrame();
            BABYLON.Tools.QueueNewFrame(function () { return _this.renderLoop(); });
        };
        GameWorld.prototype.loadScene = function (s) {
            var debugItems = document.getElementsByClassName("DEBUG");
            for (var i = 0; debugItems.length > 0;) {
                debugItems[i].parentNode.removeChild(debugItems[i]);
            }
            switch (s) {
                case 0 /* TEST */:
                    this._scene = this._scenes["TEST"].BuildScene();
                    break;
                case 2 /* GAME */:
                    this._scene = this._scenes["GAME"].BuildScene();
                    break;
                case 3 /* ANIMAL */:
                    this._scene = this._scenes["ANIMAL"].BuildScene();
                    break;
                case 4 /* TERRAINGEN */:
                    this._scene = this._scenes["TERRAINGEN"].BuildScene();
                    break;
            }
        };
        return GameWorld;
    })();
    GAME.GameWorld = GameWorld;
    (function (FullifyStates) {
        FullifyStates[FullifyStates["NO"] = 0] = "NO";
        FullifyStates[FullifyStates["SOFT"] = 1] = "SOFT";
        FullifyStates[FullifyStates["HARD"] = 2] = "HARD";
    })(GAME.FullifyStates || (GAME.FullifyStates = {}));
    var FullifyStates = GAME.FullifyStates;
    (function (Scenes) {
        Scenes[Scenes["TEST"] = 0] = "TEST";
        Scenes[Scenes["MAIN"] = 1] = "MAIN";
        Scenes[Scenes["GAME"] = 2] = "GAME";
        Scenes[Scenes["ANIMAL"] = 3] = "ANIMAL";
        Scenes[Scenes["TERRAINGEN"] = 4] = "TERRAINGEN";
        Scenes[Scenes["EXPLORE"] = 5] = "EXPLORE";
    })(GAME.Scenes || (GAME.Scenes = {}));
    var Scenes = GAME.Scenes;
    ;
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    var Player = (function () {
        function Player(scene, ground) {
            this.INTERSECTION_TRESHOLD = 4;
            this.BASE_ACCELERATION = 2;
            this.BASE_JUMP_POW = 2.8;
            this.LAND_COOLDOWN = 100;
            this.ROTATION_APPROXIMATOR = 4;
            this.MINVECTOR = new BABYLON.Vector3(-2, -10, -2);
            this.MAXVECTOR = new BABYLON.Vector3(2, 10, 2);
            this.GRAVITY = new BABYLON.Vector3(0, -0.15, 0);
            this.Controller = { "32": 0, "87": 0, "68": 0, "83": 0, "65": 0, "82": 0 };
            this._landTime = 0;
            this._lastRescueTime = 0;
            this.CurrentRotation = 0;
            this.IsEnabled = false;
            this._lastUpdateTime = 0;
            this._gameLoop = function () {
                var lastFrame = this._scene.getLastFrameDuration();
                this._ray.origin = this.parent.position.add(this._bottomVector);
                var intersection = this._ground.intersects(this._ray);
                if (!this.Controller[32] && intersection.hit && intersection.distance < this.INTERSECTION_TRESHOLD) {
                    this.parent.position.y = intersection.pickedPoint.y - this._bottomVector.y;
                    this.velocity.y = 0;
                    if (!this.isOnGround) {
                        this.isOnGround = true;
                        this._landTime = Date.now();
                        this.stopAnimation();
                    }
                }
                else {
                    this.velocity.addInPlace(this.GRAVITY);
                }
                this.ReadKeys(this.Controller);
                this.velocity = BABYLON.Vector3.Clamp(this.velocity, this.MINVECTOR, this.MAXVECTOR);
                if (this.velocity.length() > 0.001) {
                    this.parent.rotationQuaternion.toRotationMatrix(this.rotationMatrix);
                    this.parent.moveWithCollisions(BABYLON.Vector3.TransformCoordinates(this.velocity, this.rotationMatrix));
                }
                else {
                    this.velocity.scaleInPlace(0);
                }
                if (this.isOnGround) {
                    this.velocity.scaleInPlace(0.8);
                }
            };
            this._scene = scene;
            this._ground = ground;
            this._bottomVector = new BABYLON.Vector3(0, -5, 0);
            this._ray = new BABYLON.Ray(null, new BABYLON.Vector3(0, -1, 0));
            this.rotationMatrix = new BABYLON.Matrix();
            this.velocity = BABYLON.Vector3.Zero();
            this.isOnGround = false;
        }
        Player.prototype.SetEnabled = function (value) {
            this.IsEnabled = value;
        };
        Player.prototype.Initialize = function (mesh) {
            var _this = this;
            this.mesh = mesh;
            this.parent = Cast(mesh.parent);
            this.modelProperties = GAME.MODEL_ANIMATIONS[this.mesh.id];
            this._animationObject = this.mesh.animations[0];
            Cast(this.mesh).__defineSetter__("vertexData", function (val) {
                _this.mesh.setVerticesData("position", val);
            });
            this.mesh.scaling = this.modelProperties.ScalingVector;
            var boundingInfo = this.mesh.getBoundingInfo();
            this.parent.checkCollisions = true;
            this.parent.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
            this._scene.getPhysicsEngine()._unregisterMesh(this.mesh);
            this._scene.registerBeforeRender(function () { return _this._gameLoop(); });
        };
        Player.prototype.pushUpdate = function (positionData) {
            if (positionData[3] > this._lastUpdateTime) {
                this._lastUpdateTime = positionData[3];
                this.velocity.copyFromFloats.apply(this.velocity, positionData[2]);
                this.parent.rotationQuaternion.copyFromFloats.apply(this.parent.rotationQuaternion, positionData[1]);
                this.parent.position.copyFromFloats.apply(this.parent.position, positionData[0]);
            }
        };
        Player.prototype.Jump = function (power) {
            if (Date.now() - this._landTime < this.LAND_COOLDOWN)
                return;
            this.velocity.y = (this.BASE_JUMP_POW * power);
            this.parent.position.y += (1.5 * power * power);
            this.startAnimation("JUMP");
            this.isOnGround = false;
        };
        Player.prototype.Accelerate = function (factor) {
            this.startAnimation("RUN");
            this.velocity.z -= (factor * this.BASE_ACCELERATION);
        };
        Player.prototype.Rescue = function () {
            if (Date.now() - this._lastRescueTime < 5000)
                return;
            var down = BABYLON.Vector3.Up().negate();
            for (var i = 0; i < 16; i++) {
                var x = i * 5 * Math.sin(i * Math.PI / 2);
                var z = i * 5 * Math.cos(i * Math.PI / 2);
                var cranePos = this.parent.position.add(new BABYLON.Vector3(x, 50, z));
                var ray = new BABYLON.Ray(cranePos, down);
                var intersect = this._ground.intersects(ray);
                if (intersect.hit && intersect.pickedPoint.y < 5) {
                    this._lastRescueTime = Date.now();
                    this.isOnGround = true;
                    this.stopAnimation();
                    this.velocity.scaleInPlace(0);
                    this.parent.position = cranePos;
                    break;
                }
            }
        };
        Player.prototype.RotateTo = function (targetRot) {
            if (this.CurrentRotation > Math.PI * 2) {
                this.CurrentRotation -= Math.PI * 2;
            }
            else if (this.CurrentRotation < -Math.PI * 2) {
                this.CurrentRotation += Math.PI * 2;
            }
            if (this.CurrentRotation == targetRot)
                return;
            var diff = targetRot - this.CurrentRotation;
            if (diff > Math.PI) {
                diff -= Math.PI * 2;
            }
            else if (diff < -Math.PI) {
                diff += Math.PI * 2;
            }
            if (Math.abs(diff) > Math.PI / 10) {
                diff /= this.ROTATION_APPROXIMATOR;
            }
            this.parent.rotate(BABYLON.Axis.Y, diff, 0 /* LOCAL */);
            this.CurrentRotation += diff;
        };
        Player.prototype.ReadKeys = function (keys) {
            if (!this.IsEnabled)
                return;
            if (keys[32] > 0) {
                if (this.isOnGround) {
                    this.Jump(1);
                    delete keys[32];
                }
                else if (Date.now() - this._landTime > 3000) {
                    this._landTime = Date.now();
                    this.Jump(1.5);
                    delete keys[32];
                }
            }
            if (this.isOnGround || true) {
                var start = { x: 0, y: 0 };
                if (keys[87])
                    start.y += 1;
                if (keys[83])
                    start.y -= 1;
                if (keys[65])
                    start.x += 1;
                if (keys[68])
                    start.x -= 1;
                var result = (start.x + 1) * 10 + (start.y + 1);
                switch (result) {
                    case 11:
                        this.startAnimation("STAY");
                        break;
                    case 21:
                        this.Accelerate(1);
                        this.RotateTo(-Math.PI / 2);
                        break;
                    case 22:
                        this.Accelerate(0.707106781);
                        this.RotateTo(-Math.PI / 4);
                        break;
                    case 12:
                        this.Accelerate(1);
                        this.RotateTo(0);
                        break;
                    case 2:
                        this.Accelerate(0.707106781);
                        this.RotateTo(Math.PI / 4);
                        break;
                    case 1:
                        this.Accelerate(1);
                        this.RotateTo(Math.PI / 2);
                        break;
                    case 0:
                        this.Accelerate(0.707106781);
                        this.RotateTo(3 * Math.PI / 4);
                        break;
                    case 10:
                        this.Accelerate(1);
                        this.RotateTo(Math.PI);
                        break;
                    case 20:
                        this.Accelerate(0.707106781);
                        this.RotateTo(-Math.PI * 3 / 4);
                        break;
                }
            }
            if (keys[82]) {
                this.Rescue();
                delete keys[82];
            }
        };
        Player.prototype.startAnimation = function (animationKey, force) {
            if (this.currentAnimationName == animationKey && !force)
                return;
            if (this.currentAnimationName == "JUMP")
                return;
            this.stopAnimation();
            var animationProps = Cast(this.modelProperties[animationKey]);
            this.currentAnimation = this._scene.beginAnimation(this.mesh, animationProps.start, animationProps.end, animationProps.repeat, animationProps.speed);
            this.currentAnimationName = animationKey;
        };
        Player.prototype.stopAnimation = function () {
            if (this.currentAnimation) {
                this.currentAnimation.stop();
                delete this.currentAnimation;
                delete this.currentAnimationName;
            }
        };
        return Player;
    })();
    GAME.Player = Player;
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    var SCENES;
    (function (SCENES) {
        var AnimalScene = (function (_super) {
            __extends(AnimalScene, _super);
            function AnimalScene(gameWorld) {
                _super.call(this, gameWorld);
            }
            AnimalScene.prototype.BuildSceneAround = function (scene) {
                this._gameWorld._lights = [];
                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;
                this._gameWorld._lights.push(light);
                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;
                this._gameWorld._lights.push(antiLight);
                var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), scene);
                camera.ellipsoid = new BABYLON.Vector3(8, 10, 8);
                camera.checkCollisions = true;
                if (this._gameWorld._camera)
                    this._gameWorld._camera.dispose();
                this._gameWorld._camera = camera;
                camera.attachControl(this._gameWorld._canvas);
                camera.maxZ = 10000;
                camera.speed = 8;
                var animals = {};
                var animalNames = ['bearBlack', 'chowchow', 'deer', 'elk', 'fox', 'horse', 'moose', 'mountainlion', 'parrot', 'tarbuffaloA', 'vulture', 'wolf', 'goldenRetreiver'];
                var loader = BABYLON.SceneLoader;
                for (var i = 0; i < animalNames.length; i++) {
                    (function () {
                        var animal = animalNames[i];
                        var index = i;
                        loader.ImportMesh([animal], "/models/", animal + ".babylon", scene, function (x) {
                            console.log(animal, x);
                            var _animal = animal;
                            console.log(_animal + " loaded.");
                            animals[_animal] = x[0];
                            var a = Cast(x[0]);
                            Cast(scene)._physicsEngine._unregisterMesh(a);
                            a.position.x = index * 60;
                            a.position.z = index * 80;
                            var shaderMaterial = new BABYLON.ShaderMaterial("flatShader", scene, "flat", {
                                attributes: ["position", "normal", "uv", "color"],
                                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                            });
                            shaderMaterial.setVector3("cameraPosition", camera.position);
                            shaderMaterial.setVector3("light1Position", light.position);
                            shaderMaterial.setVector3("light2Position", antiLight.position);
                            shaderMaterial.setVector3("light1Color", BABYLON.Vector3.FromArray(light.diffuse.asArray()));
                            shaderMaterial.setVector3("light2Color", BABYLON.Vector3.FromArray(antiLight.diffuse.asArray()));
                            a.material = shaderMaterial;
                            if (a.animations[0]) {
                                a.animations[0]._target = a;
                                Cast(a).__defineSetter__("vertexData", function (val) {
                                    a.setVerticesData(BABYLON.VertexBuffer.PositionKind, val, true);
                                });
                            }
                        }, null, function (x) {
                            console.error("Failed to load.", arguments);
                        });
                    })();
                }
                scene.registerBeforeRender(function () {
                });
                window.addEventListener("click", function (evt) {
                    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
                    var mesh = pickResult.pickedMesh;
                    if (!mesh)
                        return;
                    if (evt.ctrlKey) {
                        mesh.material.wireframe = !pickResult.pickedMesh.material.wireframe;
                    }
                    else if (evt.altKey) {
                        var lf = Cast(mesh).lastFrame = Cast(mesh).lastFrame || 0;
                        var nf = ((lf + 1) % mesh.animations[0].getKeys().length);
                        window.document.title = lf + "->" + nf;
                        scene.beginAnimation(mesh, lf, nf, false, 1);
                        Cast(mesh).lastFrame = nf;
                    }
                    else {
                        Cast(window).lastAnimation = scene.beginAnimation(mesh, 1, mesh.animations[0].getKeys().length + 1, true, 1 + Math.random() * 10);
                    }
                });
                return scene;
            };
            return AnimalScene;
        })(GAME.SCENES.SceneBuilder);
        SCENES.AnimalScene = AnimalScene;
    })(SCENES = GAME.SCENES || (GAME.SCENES = {}));
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    var SCENES;
    (function (SCENES) {
        var ExploreScene = (function (_super) {
            __extends(ExploreScene, _super);
            function ExploreScene(gameWorld, parameters, mapParameters) {
                this._debug = parameters.debug || false;
                this._useFlatShading = parameters.useFlatShading || false;
                this._character = parameters.character;
                this._mapParams = mapParameters;
                this.followPlayer = true;
                _super.call(this, gameWorld);
            }
            ExploreScene.prototype.addLightsAndCamera = function (scene) {
                this._gameWorld._lights = [];
                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;
                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;
                this._gameWorld._lights.push(antiLight);
                this._gameWorld._lights.push(light);
                this.mainCamera = new BABYLON.FollowCamera("camera", new BABYLON.Vector3(0, 1000, 0), scene);
                this.mainCamera.maxZ = 10000;
                this.mainCamera.speed = 8;
            };
            ExploreScene.prototype.addSkyDome = function (scene) {
                var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
                skybox.rotation.y = 1.2;
                var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
                skyboxMaterial.backFaceCulling = false;
                skybox.material = skyboxMaterial;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.reflectionTexture = Cast(new BABYLON.CubeTexture("/assets/Skybox/skyrender", scene, ["0006.png", "0002.png", "0001.png", "0003.png", "0005.png", "0004.png"]));
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skybox.checkCollisions = false;
            };
            ExploreScene.prototype.generateLandscape = function (scene) {
                var heightMapGenerator = new TERRAIN.HeightMapGenerator(this._mapParams);
                var noise = heightMapGenerator.GenerateHeightMap();
                var terrainGenerator = new TERRAIN.TerrainGenerator(this._mapParams);
                Trace("Mesh from height map");
                var mountainMesh = terrainGenerator.ConvertNoiseToBabylonMesh(noise, scene);
                mountainMesh.name = "MountainMesh";
                Trace("Mesh from height map");
                Trace("Generating sides");
                var wrappingMesh = terrainGenerator.GenerateWrappingMesh(mountainMesh, scene);
                Trace("Generating sides");
                Trace("Colorize mesh");
                terrainGenerator.ColorizeMesh(mountainMesh);
                Trace("Colorize mesh");
                if (this._useFlatShading) {
                    mountainMesh.material = this._flatShader;
                }
                else {
                    var mountainMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                    mountainMesh.material = mountainMaterial;
                    mountainMaterial.specularPower = 0;
                    mountainMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                }
                mountainMesh.checkCollisions = true;
                mountainMesh.subdivide(Cast(mountainMesh).subdivisions);
                mountainMesh.createOrUpdateSubmeshesOctree();
                this.mountains = mountainMesh;
                this.mountains.material.wireframe = false;
                var mountainSideMaterial = new BABYLON.StandardMaterial("mountainSideMaterial", scene);
                wrappingMesh.material = mountainSideMaterial;
                mountainSideMaterial.specularPower = 0;
                mountainSideMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                mountainSideMaterial.diffuseColor = new BABYLON.Color3(0.43, 0.29, 0.03);
                mountainSideMaterial.bumpTexture = new BABYLON.Texture("/assets/noisenormals.jpg", scene);
            };
            ExploreScene.prototype.putStartAndEnd = function (scene) {
                this.startOrb = BABYLON.Mesh.CreateSphere("startOrb", 30, 30, scene, true);
                this.startOrb.material = new BABYLON.StandardMaterial("startOrbMat", scene);
                Cast(this.startOrb.material).emissiveColor = new BABYLON.Color3(0.3, 1.0, 0.2);
                this.endOrb = BABYLON.Mesh.CreateSphere("endOrb", 30, 30, scene, true);
                this.endOrb.material = new BABYLON.StandardMaterial("endOrbMat", scene);
                Cast(this.endOrb.material).emissiveColor = new BABYLON.Color3(1.0, 0.2, 0.3);
                this.startOrb.position = new BABYLON.Vector3(this._mapParams.pathTopOffset - this._mapParams.width / 2, 60, this._mapParams.height / 2 - 10);
                this.endOrb.position = new BABYLON.Vector3(this._mapParams.pathBottomOffset - this._mapParams.width / 2, 20, this._mapParams.height / -2 + 10);
            };
            ExploreScene.prototype.createPlayer = function (scene, meshName) {
                var _this = this;
                var playerMesh;
                BABYLON.SceneLoader.ImportMesh([meshName], "/models/", meshName + ".babylon", scene, function (x) {
                    playerMesh = Cast(x[0]);
                    playerMesh.material = _this._flatShader;
                    playerMesh.position = new BABYLON.Vector3(0, -5, 0);
                    playerMesh.rotate(BABYLON.Axis.Y, Math.PI, 0 /* LOCAL */);
                    var parent = BABYLON.Mesh.CreateSphere("colliderBox", 30, 2, scene, true);
                    parent.isVisible = false;
                    parent.ellipsoid = new BABYLON.Vector3(5, 2.5, 15);
                    playerMesh.parent = parent;
                    parent.position = _this.startOrb.position.clone();
                    var cameraFollowTarget = BABYLON.Mesh.CreateSphere("fakeKid", 30, 2, scene, false);
                    cameraFollowTarget.material = new BABYLON.StandardMaterial("fakeMat", scene);
                    cameraFollowTarget.isVisible = false;
                    cameraFollowTarget.position = parent.position.clone();
                    _this.player = new GAME.Player(scene, _this.mountains);
                    _this.player.Initialize(playerMesh);
                    scene.registerBeforeRender(function () {
                        if (_this.followPlayer && !_this.mainCamera.target) {
                            _this.mainCamera.radius = 150;
                            _this.mainCamera.heightOffset = 30;
                            _this.mainCamera.rotationOffset = 0;
                            _this.mainCamera.cameraAcceleration = 0.05;
                            _this.mainCamera.maxCameraSpeed = 4;
                            _this.mainCamera.target = cameraFollowTarget;
                            _this.mainCamera.setTarget(cameraFollowTarget.position);
                        }
                        else if (_this.mainCamera.target) {
                            var moveTarget = parent.position.subtract(cameraFollowTarget.position);
                            moveTarget.scaleInPlace(0.15);
                            cameraFollowTarget.position.addInPlace(moveTarget);
                            _this.mainCamera.rotationOffset = UTILS.Clamp((_this.player.CurrentRotation % Math.PI) / Math.PI * 180, -45, 45);
                        }
                    });
                });
            };
            ExploreScene.prototype.createFlatShader = function (scene) {
                var flatShader = new BABYLON.ShaderMaterial("flatShader", scene, "flat", {
                    attributes: ["position", "normal", "uv", "color"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                });
                var camera = scene.activeCamera;
                flatShader.setVector3("cameraPosition", camera.position);
                for (var i = 0; i < scene.lights.length; i++) {
                    var light = Cast(scene.lights[i]);
                    if (!(light instanceof BABYLON.PointLight))
                        continue;
                    flatShader.setVector3("light" + (i + 1) + "Position", light.position);
                    var colors = BABYLON.Vector3.FromArray(light.diffuse.asArray());
                    flatShader.setVector3("light" + (i + 1) + "Color", colors);
                }
                this._flatShader = flatShader;
            };
            ExploreScene.prototype.BuildSceneAround = function (scene) {
                this.addLightsAndCamera(scene);
                this.createFlatShader(scene);
                this.addSkyDome(scene);
                this.generateLandscape(scene);
                this.putStartAndEnd(scene);
                this.createPlayer(scene, this._character);
                return scene;
            };
            return ExploreScene;
        })(SCENES.SceneBuilder);
        SCENES.ExploreScene = ExploreScene;
    })(SCENES = GAME.SCENES || (GAME.SCENES = {}));
})(GAME || (GAME = {}));
var GAME;
(function (GAME) {
    var SCENES;
    (function (SCENES) {
        var TerrainGenScene = (function (_super) {
            __extends(TerrainGenScene, _super);
            function TerrainGenScene(gameWorld, parameters, mapParameters) {
                this._debug = parameters.debug || true;
                this._useFlatShading = parameters.useFlatShading;
                this._mapParams = mapParameters;
                _super.call(this, gameWorld);
            }
            TerrainGenScene.prototype.BuildSceneAround = function (scene) {
                this._gameWorld._lights = [];
                var light = new BABYLON.PointLight("sun", new BABYLON.Vector3(-1359, 260, -3040), scene);
                light.intensity = 3;
                light.diffuse.g = 0.7;
                light.diffuse.b = 0.7;
                var antiLight = new BABYLON.PointLight("antiSun", new BABYLON.Vector3(1359, 260, 3040), scene);
                antiLight.intensity = .5;
                antiLight.diffuse.g = 0.7;
                antiLight.diffuse.b = 0.7;
                this._gameWorld._lights.push(antiLight);
                this._gameWorld._lights.push(light);
                var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 250, 0), scene);
                camera.ellipsoid = new BABYLON.Vector3(8, 10, 8);
                camera.checkCollisions = true;
                if (this._gameWorld._camera)
                    this._gameWorld._camera.dispose();
                this._gameWorld._camera = camera;
                camera.attachControl(this._gameWorld._canvas);
                camera.maxZ = 10000;
                camera.speed = 8;
                var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
                skybox.rotation.y = 1.2;
                var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
                skyboxMaterial.backFaceCulling = false;
                skybox.material = skyboxMaterial;
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                skyboxMaterial.reflectionTexture = Cast(new BABYLON.CubeTexture("/assets/Skybox/skyrender", scene, ["0006.png", "0002.png", "0001.png", "0003.png", "0005.png", "0004.png"]));
                skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
                skybox.checkCollisions = false;
                var landscapeGenerator = new TERRAIN.HeightMapGenerator(this._mapParams);
                var noise = landscapeGenerator.GenerateHeightMap();
                var terrainGenerator = new TERRAIN.TerrainGenerator(this._mapParams);
                Trace("Mesh from height map");
                var mountainMesh = terrainGenerator.ConvertNoiseToBabylonMesh(noise, scene);
                mountainMesh.name = "MountainMesh";
                Trace("Mesh from height map");
                Trace("Generating sides");
                var wrappingMesh = terrainGenerator.GenerateWrappingMesh(mountainMesh, scene);
                Trace("Generating sides");
                Trace("Colorize mesh");
                terrainGenerator.ColorizeMesh(mountainMesh);
                Trace("Colorize mesh");
                if (this._useFlatShading) {
                    var flatShaderMountainMat = new BABYLON.ShaderMaterial("flatShader", scene, "flat", {
                        attributes: ["position", "normal", "uv", "color"],
                        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                    });
                    flatShaderMountainMat.setVector3("cameraPosition", camera.position);
                    flatShaderMountainMat.setVector3("light1Position", light.position);
                    flatShaderMountainMat.setVector3("light2Position", antiLight.position);
                    flatShaderMountainMat.setVector3("light1Color", BABYLON.Vector3.FromArray(light.diffuse.asArray()));
                    flatShaderMountainMat.setVector3("light2Color", BABYLON.Vector3.FromArray(antiLight.diffuse.asArray()));
                    mountainMesh.material = flatShaderMountainMat;
                }
                else {
                    var mountainMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                    mountainMesh.material = mountainMaterial;
                    mountainMaterial.specularPower = 0;
                    mountainMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                }
                mountainMesh.checkCollisions = true;
                var mountainSideMaterial = new BABYLON.StandardMaterial("mountainSideMaterial", scene);
                wrappingMesh.material = mountainSideMaterial;
                mountainSideMaterial.specularPower = 0;
                mountainSideMaterial.specularColor = BABYLON.Color3.FromInts(0, 0, 0);
                mountainSideMaterial.diffuseColor = new BABYLON.Color3(0.43, 0.29, 0.03);
                mountainSideMaterial.bumpTexture = new BABYLON.Texture("/assets/noisenormals.jpg", scene);
                var startOrb = BABYLON.Mesh.CreateSphere("startOrb", 30, 30, scene, true);
                startOrb.material = new BABYLON.StandardMaterial("startOrbMat", scene);
                Cast(startOrb.material).emissiveColor = new BABYLON.Color3(0.3, 1.0, 0.2);
                var endOrb = BABYLON.Mesh.CreateSphere("endOrb", 30, 30, scene, true);
                endOrb.material = new BABYLON.StandardMaterial("endOrbMat", scene);
                Cast(endOrb.material).emissiveColor = new BABYLON.Color3(1.0, 0.2, 0.3);
                startOrb.position = new BABYLON.Vector3(this._mapParams.pathTopOffset - this._mapParams.width / 2, 20, this._mapParams.height / 2 - 10);
                endOrb.position = new BABYLON.Vector3(this._mapParams.pathBottomOffset - this._mapParams.width / 2, 20, this._mapParams.height / -2 + 10);
                return scene;
            };
            return TerrainGenScene;
        })(SCENES.SceneBuilder);
        SCENES.TerrainGenScene = TerrainGenScene;
    })(SCENES = GAME.SCENES || (GAME.SCENES = {}));
})(GAME || (GAME = {}));
var GUI = (function () {
    function GUI(gameWorld) {
        if (typeof gameWorld !== 'undefined') {
            this.AttachTo(gameWorld);
        }
    }
    GUI.prototype.Reload = function () {
        this._gameWorld.Load(this.properties);
    };
    GUI.prototype.AttachTo = function (gameWorld) {
        this._gameWorld = gameWorld;
        this.setDefaults(this._gameWorld.parameters);
        this.initialize();
    };
    GUI.prototype.setDefaults = function (defaults) {
        this.properties = defaults;
    };
    GUI.prototype.initialize = function () {
        var _this = this;
        this._gui = new dat.GUI();
        var sceneFolder = this._gui.addFolder("Scenes");
        sceneFolder.add(this.properties, "sceneId", {
            "Test": 0 /* TEST */,
            "TerrainGen": 4 /* TERRAINGEN */,
            "Animals": 3 /* ANIMAL */,
            "Explore": 5 /* EXPLORE */,
            "Game": 2 /* GAME */
        }).name("Scene").onChange(function (x) { return _this.properties.sceneId = +x; });
        sceneFolder.open();
        var gameFolder = this._gui.addFolder("Game properties");
        var flatShadingCtr = gameFolder.add(this.properties.gameParameters, "useFlatShading").name("Use flat shading");
        var characterCtr = gameFolder.add(this.properties.gameParameters, "character", ["fox", "wolf", "deer", "elk", "mountainlion", "chowchow", "goldenRetreiver", "moose"]).name("Character").onChange(function (x) { return _this.properties.gameParameters.character = x; });
        gameFolder.open();
        var terrainGenFolder = this._gui.addFolder("Terrain and landscape");
        var randomSeedCtr = terrainGenFolder.add(this.properties.mapParameters, "randomSeed").name("Random seed").min(0).max(2000).step(1);
        var widthCtr = terrainGenFolder.add(this.properties.mapParameters, "width").name("Map width").min(160).max(2000).step(10);
        terrainGenFolder.add(this.properties.mapParameters, "height").name("Map height").min(160).max(6000).step(10);
        terrainGenFolder.add(this.properties.mapParameters, "destructionLevel").name("Destruction level").min(0).max(20).step(1);
        terrainGenFolder.add(this.properties.mapParameters, "shrink").name("Shrink").min(0.1).max(16).step(0.1);
        terrainGenFolder.add(this.properties.mapParameters, "eqFactor").name("Equalizer exponent").min(0.1).max(10).step(0.1);
        terrainGenFolder.add(this.properties.mapParameters, "displayCanvas").name("Display debug canvases");
        var pathTopCtr = terrainGenFolder.add(this.properties.mapParameters, "pathTopOffset").name("Path top offset").min(0).step(1).max(widthCtr.getValue());
        var pathBottomCtr = terrainGenFolder.add(this.properties.mapParameters, "pathBottomOffset").name("Path bottom offset").min(0).step(1).max(widthCtr.getValue());
        terrainGenFolder.add(this.properties.mapParameters, "minHeight").name("Minimum height of the map").min(0).max(100).step(5);
        terrainGenFolder.add(this.properties.mapParameters, "maxHeight").name("Maximum height of the map").min(100).max(500).step(5);
        var subdivCtr = terrainGenFolder.add(this.properties.mapParameters, "subdivisions").name("Number of subdivisions").min(1).max(300).step(1);
        widthCtr.onChange(function (x) {
            pathBottomCtr.setValue(Math.floor(x / 2)).max(x);
            pathTopCtr.setValue(Math.floor(x / 2)).max(x);
        });
        terrainGenFolder.add(this.properties.mapParameters, "param").name("Perlin-Noise parameter").min(1.0).max(3.0).step(0.1);
        terrainGenFolder.open();
        this._gui.add(this, "Reload").name("<b>GENERATE</b>");
    };
    return GUI;
})();
var TERRAIN;
(function (TERRAIN) {
    var HeightMapGenerator = (function () {
        function HeightMapGenerator(params) {
            this.Parameters = params;
            this.Canvas = CreateCanvas(params.width, params.height, true, "mainNoiseCanvas", function (c) {
                c.style.display = "none";
            });
        }
        HeightMapGenerator.prototype.GenerateHeightMap = function () {
            var _this = this;
            if (this.Parameters.heightmap) {
                var image = new Image(this.Canvas.width, this.Canvas.height);
                image.src = this.Parameters.heightmap;
                var ctx = this.Canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                return this.Canvas;
            }
            var random = this.Parameters.random;
            var noiseGenerator = new TERRAIN.ComplexNoiseGenerator();
            noiseGenerator.AddStep(function (tg) {
                var noiseGen = new TERRAIN.PerlinNoiseGenerator({
                    displayCanvas: _this.Parameters.displayCanvas,
                    height: _this.Parameters.height,
                    width: _this.Parameters.width,
                    random: random,
                    param: _this.Parameters.param || 1.1
                });
                var noiseCanvas = noiseGen.Generate();
                tg.DraftCanvases["noiseCanvas"] = noiseCanvas;
                return true;
            }, "Perlin noise generation");
            noiseGenerator.AddStep(function (tg) {
                var SHRINK = _this.Parameters.shrink;
                var pathCanvas = CreateCanvas(_this.Parameters.width / SHRINK, _this.Parameters.height / SHRINK, _this.Parameters.displayCanvas, "ravinePathCanvas");
                var pathGen = new TERRAIN.PathGenerator(random);
                pathGen.MakePath(pathCanvas, _this.Parameters.pathBottomOffset / SHRINK, _this.Parameters.pathTopOffset / SHRINK);
                tg.DraftCanvases["pathCanvas"] = pathCanvas;
                return true;
            }, "Path generation");
            noiseGenerator.AddStep(function (tg) {
                var pathCanvas = tg.DraftCanvases["pathCanvas"];
                var bleedBlurPass1 = new FILTERS.BleedFeed(pathCanvas, 30, 6, true);
                if (bleedBlurPass1.Check(pathCanvas))
                    bleedBlurPass1.Apply(pathCanvas);
                var bleedBlurPass2 = new FILTERS.BleedFeed(pathCanvas, 4, 3, true);
                if (bleedBlurPass2.Check(pathCanvas))
                    bleedBlurPass2.Apply(pathCanvas);
                var bleedBlurPass3 = new FILTERS.BleedFeed(pathCanvas, 30, 1, true);
                if (bleedBlurPass3.Check(pathCanvas))
                    bleedBlurPass3.Apply(pathCanvas);
                return true;
            }, "Path blurring");
            noiseGenerator.AddStep(function (tg) {
                var snCanvas = CreateCanvas(_this.Parameters.width / 2, _this.Parameters.height / 2, _this.Parameters.displayCanvas, "secondaryNoiseCanvas");
                var ctx = snCanvas.getContext("2d");
                var pathGen = new TERRAIN.PathGenerator(random);
                ctx.save();
                for (var i = 0; i < _this.Parameters.destructionLevel; i++) {
                    pathGen.MakePath(snCanvas, (random.Random() * snCanvas.width) | 0, (random.Random() * snCanvas.width) | 0, i == 0);
                    var randomOffset = random.Random() * snCanvas.width;
                    ctx.translate(snCanvas.width / 2 + randomOffset, snCanvas.height / 2);
                    ctx.rotate(random.Random() * 360);
                    ctx.translate(-snCanvas.width / 2 - randomOffset, -snCanvas.height / 2);
                }
                ctx.restore();
                var bleedBlurPass1 = new FILTERS.BleedFeed(snCanvas, 30, 6, true);
                var smallBlurFilter = new FILTERS.StackBlurFilter(12);
                if (bleedBlurPass1.Check(snCanvas))
                    bleedBlurPass1.Apply(snCanvas);
                if (smallBlurFilter.Check(snCanvas))
                    smallBlurFilter.Apply(snCanvas);
                tg.DraftCanvases["snCanvas"] = snCanvas;
                return true;
            }, "Secondary noise generation");
            noiseGenerator.AddStep(function (tg) {
                var noiseCanvas = tg.DraftCanvases["noiseCanvas"];
                var pathCanvas = tg.DraftCanvases["pathCanvas"];
                var snCanvas = tg.DraftCanvases["snCanvas"];
                var histogramEqualizer = new FILTERS.HistogramEqFilter(0, 1);
                var softBlur = new FILTERS.StackBlurFilter(12);
                var copyNoise = new FILTERS.CopyOverwriteFilter(noiseCanvas);
                var engraveDestruction = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(snCanvas, _this.Parameters.width, _this.Parameters.height));
                var engravePath = new FILTERS.DarknessCopyFilter(FILTERS.Upscale(pathCanvas, _this.Parameters.width, _this.Parameters.height));
                copyNoise.Apply(tg.OutCanvas);
                engraveDestruction.Apply(tg.OutCanvas);
                histogramEqualizer.Apply(tg.OutCanvas);
                softBlur.Apply(tg.OutCanvas);
                engravePath.Apply(tg.OutCanvas);
                return true;
            }, "Noise compositing");
            Trace("Terrain");
            var noise = noiseGenerator.GenerateOn(this.Canvas);
            Trace("Terrain");
            return noise;
        };
        return HeightMapGenerator;
    })();
    TERRAIN.HeightMapGenerator = HeightMapGenerator;
})(TERRAIN || (TERRAIN = {}));
function CreateCanvas(inWidth, inHeight, debug, id, preAddModifications) {
    if (debug === void 0) { debug = false; }
    if (id === void 0) { id = undefined; }
    if (preAddModifications === void 0) { preAddModifications = undefined; }
    var canvas = document.createElement("canvas");
    if (id) {
        canvas.id = id;
    }
    canvas.classList.add("DEBUG");
    canvas.width = inWidth;
    canvas.height = inHeight;
    if (preAddModifications) {
        preAddModifications(canvas);
    }
    if (debug) {
        document.body.appendChild(canvas);
    }
    return canvas;
}
function Cast(item) {
    return item;
}
function GetDataOfCanvas(index) {
    var c = document.getElementsByTagName("canvas")[index];
    var ctx = c.getContext("2d");
    var imgData = ctx.getImageData(0, 0, c.width, c.height);
    return [c, ctx, imgData];
}
function Trace(message) {
    this.TRACES = this.TRACES || {};
    if (this.TRACES[message]) {
        delete this.TRACES[message];
        var depth = "";
        for (var i = 0; i < Object.keys(this.TRACES).length; i++)
            depth += ">";
        console.log(depth + message + " finished.");
        console.timeEnd(message);
    }
    else {
        var depth = "";
        for (var i = 0; i < Object.keys(this.TRACES).length; i++)
            depth += ">";
        console.log("Starting " + depth + message + ".");
        console.time(message);
        this.TRACES[message] = message;
    }
}
var MersenneTwister = (function () {
    function MersenneTwister(seed) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 0x9908b0df;
        this.UPPER_MASK = 0x80000000;
        this.LOWER_MASK = 0x7fffffff;
        this.mt = new Array(this.N);
        this.mti = this.N + 1;
        this.init_genrand(seed);
    }
    MersenneTwister.prototype.Random = function () {
        return this.random();
    };
    MersenneTwister.prototype.init_genrand = function (s) {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            var sx = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] = (((((sx & 0xffff0000) >>> 16) * 1812433253) << 16) + (sx & 0x0000ffff) * 1812433253) + this.mti;
            this.mt[this.mti] >>>= 0;
        }
    };
    MersenneTwister.prototype.init_by_array = function (init_key, key_length) {
        var i, j, k;
        this.init_genrand(19650218);
        i = 1;
        j = 0;
        k = (this.N > key_length ? this.N : key_length);
        for (; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + init_key[j] + j;
            this.mt[i] >>>= 0;
            i++;
            j++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
            if (j >= key_length)
                j = 0;
        }
        for (k = this.N - 1; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
            this.mt[i] >>>= 0;
            i++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
        }
        this.mt[0] = 0x80000000;
    };
    MersenneTwister.prototype.genrand_int32 = function () {
        var y;
        var mag01 = new Array(0x0, this.MATRIX_A);
        if (this.mti >= this.N) {
            var kk;
            if (this.mti == this.N + 1)
                this.init_genrand(5489);
            for (kk = 0; kk < this.N - this.M; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
            this.mti = 0;
        }
        y = this.mt[this.mti++];
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= (y >>> 18);
        return y >>> 0;
    };
    MersenneTwister.prototype.genrand_int31 = function () {
        return (this.genrand_int32() >>> 1);
    };
    MersenneTwister.prototype.genrand_real1 = function () {
        return this.genrand_int32() * (1.0 / 4294967295.0);
    };
    MersenneTwister.prototype.random = function () {
        return this.genrand_int32() * (1.0 / 4294967296.0);
    };
    MersenneTwister.prototype.genrand_real3 = function () {
        return (this.genrand_int32() + 0.5) * (1.0 / 4294967296.0);
    };
    MersenneTwister.prototype.genrand_res53 = function () {
        var a = this.genrand_int32() >>> 5, b = this.genrand_int32() >>> 6;
        return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
    };
    return MersenneTwister;
})();
var TERRAIN;
(function (TERRAIN) {
    var PathGenerator = (function () {
        function PathGenerator(random) {
            this.random = random;
        }
        PathGenerator.prototype.MakePath = function (canvas, from, to, opaque) {
            if (opaque === void 0) { opaque = true; }
            var ctrlPoints = this.GeneratePath(canvas, from, to);
            var cmspline = this.makeCatmull(ctrlPoints);
            this.drawPath(canvas, cmspline, opaque);
            return canvas;
        };
        PathGenerator.prototype.GeneratePath = function (canvas, from, to) {
            from = from && [from] || [from, from];
            to = to && [to] || [to, to];
            from[0] = from[0] || 0;
            to[0] = to[0] || canvas.width;
            from[1] = from[1] || canvas.height;
            to[1] = to[1] || 0;
            var STEPS = 10;
            var ITERATIONS = 15;
            var dx = (to[0] - from[0]) / STEPS;
            var dy = (to[1] - from[1]) / STEPS;
            var normal = [-dy / 2, dx / 2];
            var abnormal = [-normal[0], -normal[1]];
            var ctrlPoints = [];
            ctrlPoints.push(from, from);
            var intermediatePoints = [];
            for (var i = 1; i < STEPS; i++) {
                intermediatePoints.push([from[0] + dx * i, from[1] + dy * i]);
            }
            for (var i = 0; i < ITERATIONS; i++) {
                var randomElement = intermediatePoints[Math.floor(this.random.Random() * intermediatePoints.length)];
                var offset = (i % 2) ? normal : abnormal;
                randomElement[0] += offset[0];
                randomElement[1] += offset[1];
            }
            for (var i = 0; i < intermediatePoints.length; i++) {
                ctrlPoints.push(intermediatePoints[i]);
            }
            ctrlPoints.push(to, to);
            return ctrlPoints;
        };
        PathGenerator.prototype.interpolate = function (P0, P1, P2, P3, u) {
            var u3 = u * u * u;
            var u2 = u * u;
            var f1 = -0.5 * u3 + u2 - 0.5 * u;
            var f2 = 1.5 * u3 - 2.5 * u2 + 1.0;
            var f3 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
            var f4 = 0.5 * u3 - 0.5 * u2;
            var x = P0[0] * f1 + P1[0] * f2 + P2[0] * f3 + P3[0] * f4;
            var y = P0[1] * f1 + P1[1] * f2 + P2[1] * f3 + P3[1] * f4;
            return [x, y];
        };
        PathGenerator.prototype.drawCatmull = function (canvas, points, xoffset) {
            var ctx = canvas.getContext("2d");
            xoffset = xoffset || 0;
            for (var i = 0; i < points.length - 3; i++) {
                ctx.beginPath();
                ctx.moveTo(points[i + 1][0], points[i + 1][1]);
                for (var j = 0; j < 50; j++) {
                    var pi = this.interpolate(points[i], points[i + 1], points[i + 2], points[i + 3], j / 50);
                    ctx.lineTo(pi[0] + xoffset, pi[1]);
                }
                ctx.stroke();
            }
        };
        PathGenerator.prototype.makeCatmull = function (anchors) {
            var _points = [];
            for (var i = 0; i < anchors.length - 3; i++) {
                var diff = Math.abs(anchors[i + 1][1] - anchors[i + 2][1]);
                for (var j = 0; j < diff; j++) {
                    var pi = this.interpolate(anchors[i], anchors[i + 1], anchors[i + 2], anchors[i + 3], j / diff);
                    _points.push([pi[0], pi[1], 0, 0, 0]);
                }
            }
            return _points;
        };
        PathGenerator.prototype.drawPath = function (canvas, points, clearBeforeDraw) {
            var ctx = canvas.getContext("2d");
            ctx.save();
            if (clearBeforeDraw) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.moveTo(points[0][0], points[0][1]);
            ctx.beginPath();
            for (var j = 0; j < points.length; j++)
                ctx.lineTo(points[j][0], points[j][1]);
            ctx.stroke();
            ctx.restore();
        };
        return PathGenerator;
    })();
    TERRAIN.PathGenerator = PathGenerator;
})(TERRAIN || (TERRAIN = {}));
var TERRAIN;
(function (TERRAIN) {
    var PerlinNoiseGenerator = (function () {
        function PerlinNoiseGenerator(inParameters) {
            this.Canvas = CreateCanvas(inParameters.width, inParameters.height, inParameters.displayCanvas);
            this.Parameters = inParameters;
            this.Random = inParameters.random;
        }
        PerlinNoiseGenerator.prototype.randomNoise = function (separateCanvas, displayCanvas) {
            var noiseCanvas = separateCanvas ? CreateCanvas(this.Parameters.width, this.Parameters.height, displayCanvas) : this.Canvas;
            var g = noiseCanvas.getContext("2d"), imageData = g.getImageData(0, 0, noiseCanvas.width, noiseCanvas.height), pixels = imageData.data;
            for (var i = 0; i < pixels.length; i += 4) {
                pixels[i] = pixels[i + 1] = pixels[i + 2] = (this.Random.Random() * 256) | 0;
                pixels[i + 3] = 255;
            }
            g.putImageData(imageData, 0, 0);
            return noiseCanvas;
        };
        PerlinNoiseGenerator.prototype.Generate = function (canvas, separateCanvas) {
            if (separateCanvas === void 0) { separateCanvas = true; }
            var noise = this.randomNoise(separateCanvas, this.Parameters.displayCanvas);
            canvas = canvas || this.Canvas || CreateCanvas(this.Parameters.width, this.Parameters.height, this.Parameters.displayCanvas);
            var context = canvas.getContext("2d");
            context.save();
            var ratio = this.Parameters.width / this.Parameters.height;
            for (var size = 4; size <= noise.height; size *= this.Parameters.param) {
                var x = (this.Random.Random() * (noise.width - size)) | 0, y = (this.Random.Random() * (noise.height - size)) | 0;
                context.globalAlpha = 4 / size;
                context.drawImage(noise, Math.max(x, 0), y, size * ratio, size, 0, 0, this.Parameters.width, this.Parameters.height);
            }
            context.restore();
            return canvas;
        };
        return PerlinNoiseGenerator;
    })();
    TERRAIN.PerlinNoiseGenerator = PerlinNoiseGenerator;
})(TERRAIN || (TERRAIN = {}));
var UTILS;
(function (UTILS) {
    function Clamp(scalar, min, max) {
        return Math.max(Math.min(scalar, max), min);
    }
    UTILS.Clamp = Clamp;
    function Mixin(mixThis, toThis, dontTouchExistingProperties) {
        var f = dontTouchExistingProperties;
        var fromKeys = Object.keys(mixThis);
        var toKeys = Object.keys(toThis);
        for (var i = 0; i < fromKeys.length; i++) {
            var key = fromKeys[i];
            if (toThis.hasOwnProperty(key) && f)
                continue;
            else {
                if (toThis[key] instanceof Object && mixThis[key] instanceof Object) {
                    Mixin(mixThis[key], toThis[key], f);
                }
                else {
                    if (mixThis[key] !== "undedfined" && mixThis[key] !== null) {
                        toThis[key] = mixThis[key];
                    }
                }
            }
        }
        return toThis;
    }
    UTILS.Mixin = Mixin;
})(UTILS || (UTILS = {}));
var TERRAIN;
(function (TERRAIN) {
    var TerrainGenerator = (function () {
        function TerrainGenerator(params) {
            this._gradientBase = 0;
            this.Parameters = params;
            this.Parameters.colors = this.Parameters.colors || [[0, "#088A08"], [0.0111, "#088A08"], [0.0112, "#5E610B"], [0.7, "#190B07"], [1, "#BDBDBD"]];
        }
        TerrainGenerator.prototype.getHeightColorFor = function (height) {
            var gradientCanvas;
            var width = this._maxHeight | 0 - this._minHeight | 0;
            if (this._gradient == null) {
                gradientCanvas = CreateCanvas(width, 2, this.Parameters.displayCanvas, "gradientsCanvas");
                var ctx = gradientCanvas.getContext("2d");
                var mountainGradient = ctx.createLinearGradient(0, 0, gradientCanvas.width, 1);
                var gradient2 = ctx.createLinearGradient(0, 0, gradientCanvas.width, 1);
                for (var i = 0; i < this.Parameters.colors.length; i++) {
                    var colorStop = this.Parameters.colors[i];
                    mountainGradient.addColorStop(colorStop[0], colorStop[1]);
                }
                gradient2.addColorStop(0, "#000000");
                gradient2.addColorStop(1, "#ffffff");
                ctx.fillStyle = mountainGradient;
                ctx.fillRect(0, 0, gradientCanvas.width, 1);
                ctx.fillStyle = gradient2;
                ctx.fillRect(0, 1, gradientCanvas.width, 1);
                this._gradient = ctx.getImageData(0, 0, gradientCanvas.width, gradientCanvas.height);
            }
            var index = (height * (width) * 4) | 0;
            index -= index % 4;
            index = index % ((width) * 4);
            index += this._gradientBase;
            return [this._gradient.data[index], this._gradient.data[index + 1], this._gradient.data[index + 2]];
        };
        TerrainGenerator.prototype.ColorizeMesh = function (mesh) {
            var positionData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var colorData = [];
            Trace("Mapping");
            var copy = positionData.map(function (x, i) {
                return i % 3 == 1 ? x : 0;
            });
            Trace("Mapping");
            Trace("Min/Max");
            console.log("Total number of vertices:" + copy.length / 3);
            this._maxHeight = Math.max.apply(null, copy);
            this._minHeight = Math.min.apply(null, copy);
            var heightScale = this._maxHeight - this._minHeight;
            Trace("Min/Max");
            Trace("Color fetching");
            for (var i = 1; i < positionData.length; i += 3) {
                var h = (positionData[i] - this._minHeight) / heightScale;
                var color = this.getHeightColorFor(h);
                colorData.push(color[0] / 255, color[1] / 255, color[2] / 255);
            }
            Trace("Color fetching");
            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorData, true);
        };
        TerrainGenerator.prototype.GenerateWrappingMesh = function (mesh, scene) {
            var vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var bbox = mesh.getBoundingInfo();
            var xMin = bbox.minimum.x;
            var xMax = bbox.maximum.x;
            var zMin = bbox.minimum.z;
            var zMax = bbox.maximum.z;
            var yMin = bbox.minimum.y;
            var yMax = bbox.maximum.y;
            var checkTriadIsOnXEdge = function (x, y, z) {
                if (x == xMin || x == xMax)
                    return true;
                return false;
            };
            var checkTriadIsOnZEdge = function (x, y, z) {
                if (z == zMin || z == zMax)
                    return true;
                return false;
            };
            var xLeft = [];
            var xRight = [];
            var zTop = [];
            var zBottom = [];
            var maxDistance = Math.sqrt(xMin * xMin + zMin * zMin);
            for (var i = 0; i < vertices.length; i += 3) {
                var x = vertices[i];
                var y = vertices[i + 1];
                var z = vertices[i + 2];
                var d = Math.sqrt(x * x + z * z);
                var bottomCoverHeight = -70 - Math.floor(100 * maxDistance / d);
                if (checkTriadIsOnXEdge(x, y, z)) {
                    if (x == xMin)
                        xLeft.push(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                    else
                        xRight.unshift(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                }
                else if (checkTriadIsOnZEdge(x, y, z)) {
                    if (z == zMin)
                        zBottom.push(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                    else
                        zTop.unshift(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                }
            }
            var wrappingPoints = xRight.concat(zTop, xLeft, zBottom);
            var wrappingUvs = [];
            var uvxprog = 1 / (wrappingPoints.length / 6);
            for (var i = 0; i < wrappingPoints.length / 3; i += 2) {
                wrappingUvs.push(uvxprog * i, wrappingPoints[3 * i + 1] / yMax, uvxprog * i, 0);
            }
            var wrappingIndices = [];
            var triplets = wrappingPoints.length / 3;
            for (var i = 0; i < triplets; i += 2) {
                wrappingIndices.push(i, (i + 1) % triplets, (i + 3) % triplets);
                wrappingIndices.push((i + 2) % triplets, i, (i + 3) % triplets);
            }
            var wrappingNormals = [];
            BABYLON.VertexData.ComputeNormals(wrappingPoints, wrappingIndices, wrappingNormals);
            var vertexData = new BABYLON.VertexData();
            vertexData.indices = wrappingIndices;
            vertexData.positions = wrappingPoints;
            vertexData.normals = wrappingNormals;
            vertexData.uvs = wrappingUvs;
            var wrappingMesh = new BABYLON.Mesh("wrapper", scene);
            vertexData.applyToMesh(wrappingMesh, false);
            return wrappingMesh;
        };
        TerrainGenerator.prototype.ConvertNoiseToBabylonMesh = function (noise, scene) {
            var terrainMesh = BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas(name, noise, this.Parameters.width, this.Parameters.height, this.Parameters.subdivisions, this.Parameters.minHeight, this.Parameters.maxHeight, scene, false);
            return terrainMesh;
        };
        return TerrainGenerator;
    })();
    TERRAIN.TerrainGenerator = TerrainGenerator;
})(TERRAIN || (TERRAIN = {}));
var TERRAIN;
(function (TERRAIN) {
    var ComplexNoiseGenerator = (function () {
        function ComplexNoiseGenerator() {
            this.Steps = [];
            this.DraftCanvases = {};
            this._stepCounter = 0;
        }
        ComplexNoiseGenerator.prototype.GenerateOn = function (canvas) {
            this.OutCanvas = canvas;
            while (this.Steps.length > 0) {
                var actualStep = this.Steps.shift();
                var result = actualStep.Execute(this);
                if (!result) {
                    this.Steps.unshift(actualStep);
                }
            }
            return canvas;
        };
        ComplexNoiseGenerator.prototype.AddStep = function (step, tag) {
            tag = tag || "Step " + this._stepCounter;
            this._stepCounter += 1;
            this.Steps.push(new ComplexNoiseGenStep(step, tag));
        };
        return ComplexNoiseGenerator;
    })();
    TERRAIN.ComplexNoiseGenerator = ComplexNoiseGenerator;
    var ComplexNoiseGenStep = (function () {
        function ComplexNoiseGenStep(func, tag) {
            this._func = func;
            this._tag = tag;
        }
        ComplexNoiseGenStep.prototype.Execute = function (executeOn) {
            console.time(JSON.stringify(this._tag));
            console.log("Starting step:", this._tag);
            var result = this._func(executeOn);
            console.timeEnd(JSON.stringify(this._tag));
            console.log("Finished: ", this._tag, ".");
            return result;
        };
        return ComplexNoiseGenStep;
    })();
    TERRAIN.ComplexNoiseGenStep = ComplexNoiseGenStep;
})(TERRAIN || (TERRAIN = {}));
