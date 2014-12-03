﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BABYLON;
(function (BABYLON) {
    var DynamicTexture = (function (_super) {
        __extends(DynamicTexture, _super);
        function DynamicTexture(name, options, scene, generateMipMaps) {
            _super.call(this, null, scene, !generateMipMaps);

            this.name = name;

            this.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
            this.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

            this._generateMipMaps = generateMipMaps;

            if (options.getContext) {
                this._canvas = options;
                this._texture = scene.getEngine().createDynamicTexture(options.width, options.height, generateMipMaps);
            } else {
                this._canvas = document.createElement("canvas");

                if (options.width) {
                    this._texture = scene.getEngine().createDynamicTexture(options.width, options.height, generateMipMaps);
                } else {
                    this._texture = scene.getEngine().createDynamicTexture(options, options, generateMipMaps);
                }
            }

            var textureSize = this.getSize();

            this._canvas.width = textureSize.width;
            this._canvas.height = textureSize.height;
            this._context = this._canvas.getContext("2d");
        }
        DynamicTexture.prototype.getContext = function () {
            return this._context;
        };

        DynamicTexture.prototype.update = function (invertY) {
            this.getScene().getEngine().updateDynamicTexture(this._texture, this._canvas, invertY === undefined ? true : invertY);
        };

        DynamicTexture.prototype.drawText = function (text, x, y, font, color, clearColor, invertY) {
            var size = this.getSize();
            if (clearColor) {
                this._context.fillStyle = clearColor;
                this._context.fillRect(0, 0, size.width, size.height);
            }

            this._context.font = font;
            if (x === null) {
                var textSize = this._context.measureText(text);
                x = (size.width - textSize.width) / 2;
            }

            this._context.fillStyle = color;
            this._context.fillText(text, x, y);

            this.update(invertY);
        };

        DynamicTexture.prototype.clone = function () {
            var textureSize = this.getSize();
            var newTexture = new BABYLON.DynamicTexture(this.name, textureSize.width, this.getScene(), this._generateMipMaps);

            // Base texture
            newTexture.hasAlpha = this.hasAlpha;
            newTexture.level = this.level;

            // Dynamic Texture
            newTexture.wrapU = this.wrapU;
            newTexture.wrapV = this.wrapV;

            return newTexture;
        };
        return DynamicTexture;
    })(BABYLON.Texture);
    BABYLON.DynamicTexture = DynamicTexture;
})(BABYLON || (BABYLON = {}));
