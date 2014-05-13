﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BABYLON;
(function (BABYLON) {
    var SwitchBooleanAction = (function (_super) {
        __extends(SwitchBooleanAction, _super);
        function SwitchBooleanAction(trigger, target, propertyPath, condition) {
            _super.call(this, trigger, condition);
            this.propertyPath = propertyPath;
            this._target = target;
        }
        SwitchBooleanAction.prototype._prepare = function () {
            this._target = this._getEffectiveTarget(this._target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);
        };

        SwitchBooleanAction.prototype.execute = function () {
            this._target[this._property] = !this._target[this._property];
        };
        return SwitchBooleanAction;
    })(BABYLON.Action);
    BABYLON.SwitchBooleanAction = SwitchBooleanAction;

    var SetValueAction = (function (_super) {
        __extends(SetValueAction, _super);
        function SetValueAction(trigger, target, propertyPath, value, condition) {
            _super.call(this, trigger, condition);
            this.propertyPath = propertyPath;
            this.value = value;
            this._target = target;
        }
        SetValueAction.prototype._prepare = function () {
            this._target = this._getEffectiveTarget(this._target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);
        };

        SetValueAction.prototype.execute = function () {
            this._target[this._property] = this.value;
        };
        return SetValueAction;
    })(BABYLON.Action);
    BABYLON.SetValueAction = SetValueAction;

    var IncrementValueAction = (function (_super) {
        __extends(IncrementValueAction, _super);
        function IncrementValueAction(trigger, target, propertyPath, value, condition) {
            _super.call(this, trigger, condition);
            this.propertyPath = propertyPath;
            this.value = value;
            this._target = target;
        }
        IncrementValueAction.prototype._prepare = function () {
            this._target = this._getEffectiveTarget(this._target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);

            if (typeof this._target[this._property] !== "number") {
                console.warn("Warning: IncrementValueAction can only be used with number values");
            }
        };

        IncrementValueAction.prototype.execute = function () {
            this._target[this._property] += this.value;
        };
        return IncrementValueAction;
    })(BABYLON.Action);
    BABYLON.IncrementValueAction = IncrementValueAction;

    var PlayAnimationAction = (function (_super) {
        __extends(PlayAnimationAction, _super);
        function PlayAnimationAction(trigger, target, from, to, loop, condition) {
            _super.call(this, trigger, condition);
            this.from = from;
            this.to = to;
            this.loop = loop;
            this._target = target;
        }
        PlayAnimationAction.prototype._prepare = function () {
        };

        PlayAnimationAction.prototype.execute = function () {
            var scene = this._actionManager.getScene();
            scene.beginAnimation(this._target, this.from, this.to, this.loop);
        };
        return PlayAnimationAction;
    })(BABYLON.Action);
    BABYLON.PlayAnimationAction = PlayAnimationAction;

    var StopAnimationAction = (function (_super) {
        __extends(StopAnimationAction, _super);
        function StopAnimationAction(trigger, target, condition) {
            _super.call(this, trigger, condition);
            this._target = target;
        }
        StopAnimationAction.prototype._prepare = function () {
        };

        StopAnimationAction.prototype.execute = function () {
            var scene = this._actionManager.getScene();
            scene.stopAnimation(this._target);
        };
        return StopAnimationAction;
    })(BABYLON.Action);
    BABYLON.StopAnimationAction = StopAnimationAction;

    var DoNothingAction = (function (_super) {
        __extends(DoNothingAction, _super);
        function DoNothingAction(trigger, condition) {
            if (typeof trigger === "undefined") { trigger = BABYLON.ActionManager.NoneTrigger; }
            _super.call(this, trigger, condition);
        }
        DoNothingAction.prototype.execute = function () {
        };
        return DoNothingAction;
    })(BABYLON.Action);
    BABYLON.DoNothingAction = DoNothingAction;

    var CombineAction = (function (_super) {
        __extends(CombineAction, _super);
        function CombineAction(trigger, children, condition) {
            _super.call(this, trigger, condition);
            this.children = children;
        }
        CombineAction.prototype._prepare = function () {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index]._actionManager = this._actionManager;
                this.children[index]._prepare();
            }
        };

        CombineAction.prototype.execute = function () {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].execute();
            }
        };
        return CombineAction;
    })(BABYLON.Action);
    BABYLON.CombineAction = CombineAction;

    var ExecuteCodeAction = (function (_super) {
        __extends(ExecuteCodeAction, _super);
        function ExecuteCodeAction(trigger, func, condition) {
            _super.call(this, trigger, condition);
            this.func = func;
        }
        ExecuteCodeAction.prototype.execute = function () {
            this.func();
        };
        return ExecuteCodeAction;
    })(BABYLON.Action);
    BABYLON.ExecuteCodeAction = ExecuteCodeAction;

    var SetParentAction = (function (_super) {
        __extends(SetParentAction, _super);
        function SetParentAction(trigger, target, parent, condition) {
            _super.call(this, trigger, condition);
            this._target = target;
            this._parent = parent;
        }
        SetParentAction.prototype._prepare = function () {
        };

        SetParentAction.prototype.execute = function () {
            if (this._target.parent === this._parent) {
                return;
            }

            var invertParentWorldMatrix = this._parent.getWorldMatrix().clone();
            invertParentWorldMatrix.invert();

            this._target.position = BABYLON.Vector3.TransformCoordinates(this._target.position, invertParentWorldMatrix);

            this._target.parent = this._parent;
        };
        return SetParentAction;
    })(BABYLON.Action);
    BABYLON.SetParentAction = SetParentAction;
})(BABYLON || (BABYLON = {}));
