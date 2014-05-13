﻿"use strict";

var BABYLON = BABYLON || {};

(function () {
    BABYLON.TouchCamera = function (name, position, scene) {
        BABYLON.FreeCamera.call(this, name, position, scene);
            
        // Offset
        this._offsetX = null;
        this._offsetY = null;
        this._pointerCount = 0;
        this._pointerPressed = [];
    };

    BABYLON.TouchCamera.prototype = Object.create(BABYLON.FreeCamera.prototype);

    BABYLON.TouchCamera.prototype.angularSensibility = 200000.0;
    BABYLON.TouchCamera.prototype.moveSensibility = 500.0;


    // Controls
    BABYLON.TouchCamera.prototype.attachControl = function (canvas, noPreventDefault) {
        var previousPosition;
        var that = this;
        
        if (this._attachedCanvas) {
            return;
        }
        this._attachedCanvas = canvas;

        if (this._onPointerDown === undefined) {

            this._onPointerDown = function(evt) {

                if (!noPreventDefault) {
                    evt.preventDefault();
                }

                that._pointerPressed.push(evt.pointerId);

                if (that._pointerPressed.length !== 1) {
                    return;
                }

                previousPosition = {
                    x: evt.clientX,
                    y: evt.clientY
                };
            };

            this._onPointerUp = function(evt) {
                if (!noPreventDefault) {
                    evt.preventDefault();
                }

                var index = that._pointerPressed.indexOf(evt.pointerId);

                if (index === -1) {
                    return;
                }
                that._pointerPressed.splice(index, 1);

                if (index != 0) {
                    return;
                }
                previousPosition = null;
                that._offsetX = null;
                that._offsetY = null;
            };

            this._onPointerMove = function(evt) {
                if (!noPreventDefault) {
                    evt.preventDefault();
                }

                if (!previousPosition) {
                    return;
                }

                var index = that._pointerPressed.indexOf(evt.pointerId);

                if (index != 0) {
                    return;
                }

                that._offsetX = evt.clientX - previousPosition.x;
                that._offsetY = -(evt.clientY - previousPosition.y);
            };

            this._onLostFocus = function() {
                that._offsetX = null;
                that._offsetY = null;
            };
        }

        canvas.addEventListener("pointerdown", this._onPointerDown);
        canvas.addEventListener("pointerup", this._onPointerUp);
        canvas.addEventListener("pointerout", this._onPointerUp);
        canvas.addEventListener("pointermove", this._onPointerMove);

        BABYLON.Tools.RegisterTopRootEvents([
            { name: "blur", handler: this._onLostFocus }
        ]);
    };

    BABYLON.TouchCamera.prototype.detachControl = function (canvas) {
        if (this._attachedCanvas != canvas) {
            return;
        }

        canvas.removeEventListener("pointerdown", this._onPointerDown);
        canvas.removeEventListener("pointerup", this._onPointerUp);
        canvas.removeEventListener("pointerout", this._onPointerUp);
        canvas.removeEventListener("pointermove", this._onPointerMove);

        BABYLON.Tools.UnregisterTopRootEvents([
            { name: "blur", handler: this._onLostFocus }
        ]);
        
        this._attachedCanvas = null;
    };
    
    BABYLON.TouchCamera.prototype._checkInputs = function () {
        if (!this._offsetX) {
            return;
        }
        this.cameraRotation.y += this._offsetX / this.angularSensibility;

        if (this._pointerPressed.length > 1) {
            this.cameraRotation.x += -this._offsetY / this.angularSensibility;
        } else {
            var speed = this._computeLocalCameraSpeed();
            var direction = new BABYLON.Vector3(0, 0, speed * this._offsetY / this.moveSensibility);

            BABYLON.Matrix.RotationYawPitchRollToRef(this.rotation.y, this.rotation.x, 0, this._cameraRotationMatrix);
            this.cameraDirection.addInPlace(BABYLON.Vector3.TransformCoordinates(direction, this._cameraRotationMatrix));
        }
    };
})();