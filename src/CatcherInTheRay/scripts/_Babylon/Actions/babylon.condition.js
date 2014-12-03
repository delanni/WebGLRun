﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BABYLON;
(function (BABYLON) {
    var Condition = (function () {
        function Condition(actionManager) {
            this._actionManager = actionManager;
        }
        Condition.prototype.isValid = function () {
            return true;
        };

        Condition.prototype._getProperty = function (propertyPath) {
            return this._actionManager._getProperty(propertyPath);
        };

        Condition.prototype._getEffectiveTarget = function (target, propertyPath) {
            return this._actionManager._getEffectiveTarget(target, propertyPath);
        };
        return Condition;
    })();
    BABYLON.Condition = Condition;

    var StateCondition = (function (_super) {
        __extends(StateCondition, _super);
        function StateCondition(actionManager, target, propertyPath, value, operator) {
            if (typeof operator === "undefined") { operator = StateCondition.IsEqual; }
            _super.call(this, actionManager);
            this.propertyPath = propertyPath;
            this.value = value;
            this.operator = operator;

            this._target = this._getEffectiveTarget(target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);
        }
        // Methods
        StateCondition.prototype.isValid = function () {
            switch (this.operator) {
                case StateCondition.IsGreater:
                    return this._target[this._property] > this.value;
                case StateCondition.IsLesser:
                    return this._target[this._property] < this.value;
                case StateCondition.IsEqual:
                case StateCondition.IsDifferent:
                    var check;

                    if (this.value.equals) {
                        check = this.value.equals(this._target[this._property]);
                    } else {
                        check = this.value === this._target[this._property];
                    }
                    return this.operator === StateCondition.IsEqual ? check : !check;
            }

            return false;
        };
        StateCondition.IsEqual = 0;
        StateCondition.IsDifferent = 1;
        StateCondition.IsGreater = 2;
        StateCondition.IsLesser = 3;
        return StateCondition;
    })(Condition);
    BABYLON.StateCondition = StateCondition;

    var PredicateCondition = (function (_super) {
        __extends(PredicateCondition, _super);
        function PredicateCondition(actionManager, predicate) {
            _super.call(this, actionManager);
            this.predicate = predicate;
        }
        PredicateCondition.prototype.isValid = function () {
            return this.predicate();
        };
        return PredicateCondition;
    })(Condition);
    BABYLON.PredicateCondition = PredicateCondition;
})(BABYLON || (BABYLON = {}));
