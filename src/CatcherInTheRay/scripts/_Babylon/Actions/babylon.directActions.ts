﻿module BABYLON {
    export class SwitchBooleanAction extends Action {
        private _target: any;
        private _property: string;

        constructor(trigger: number, target: any, public propertyPath: string, condition?: Condition) {
            super(trigger, condition);
            this._target = target;
        }

        public _prepare(): void {
            this._target = this._getEffectiveTarget(this._target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);
        }

        public execute(): void {
            this._target[this._property] = !this._target[this._property];
        }
    }

    export class SetValueAction extends Action {
        private _target: any;
        private _property: string;

        constructor(trigger: number, target: any, public propertyPath: string, public value: any, condition?: Condition) {
            super(trigger, condition);
            this._target = target;
        }

        public _prepare(): void {
            this._target = this._getEffectiveTarget(this._target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);
        }

        public execute(): void {
            this._target[this._property] = this.value;
        }
    }

    export class IncrementValueAction extends Action {
        private _target: any;
        private _property: string;

        constructor(trigger: number, target: any, public propertyPath: string, public value: any, condition?: Condition) {
            super(trigger, condition);
            this._target = target;
        }

        public _prepare(): void {
            this._target = this._getEffectiveTarget(this._target, this.propertyPath);
            this._property = this._getProperty(this.propertyPath);

            if (typeof this._target[this._property] !== "number") {
                console.warn("Warning: IncrementValueAction can only be used with number values");
            }
        }

        public execute(): void {
            this._target[this._property] += this.value;
        }
    }

    export class PlayAnimationAction extends Action {
        private _target: any;

        constructor(trigger: number, target: any, public from: number, public to: number, public loop?: boolean, condition?: Condition) {
            super(trigger, condition);
            this._target = target;
        }

        public _prepare(): void {
        }

        public execute(): void {
            var scene = this._actionManager.getScene();
            scene.beginAnimation(this._target, this.from, this.to, this.loop);
        }
    }

    export class StopAnimationAction extends Action {
        private _target: any;

        constructor(trigger: number, target: any, condition?: Condition) {
            super(trigger, condition);
            this._target = target;
        }

        public _prepare(): void {           
        }

        public execute(): void {
            var scene = this._actionManager.getScene();
            scene.stopAnimation(this._target);
        }
    }

    export class DoNothingAction extends Action {
        constructor(trigger: number = ActionManager.NoneTrigger, condition?: Condition) {
            super(trigger, condition);
        }

        public execute(): void {
        }
    }

    export class CombineAction extends Action {
        constructor(trigger: number, public children: Action[], condition?: Condition) {
            super(trigger, condition);
        }

        public _prepare(): void {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index]._actionManager = this._actionManager;
                this.children[index]._prepare();
            }
        }

        public execute(): void {
            for (var index = 0; index < this.children.length; index++) {
                this.children[index].execute();
            }
        }
    }

    export class ExecuteCodeAction extends Action {
        constructor(trigger: number, public func: () => void, condition?: Condition) {
            super(trigger, condition);
        }

        public execute(): void {
            this.func();
        }
    }

    export class SetParentAction extends Action {
        private _parent: any;
        private _target: any;

        constructor(trigger: number, target: any, parent: any, condition?: Condition) {
            super(trigger, condition);
            this._target = target;
            this._parent = parent;
        }

        public _prepare(): void {
        }

        public execute(): void {
            if (this._target.parent === this._parent) {
                return;
            }

            var invertParentWorldMatrix = this._parent.getWorldMatrix().clone();
            invertParentWorldMatrix.invert();

            this._target.position = BABYLON.Vector3.TransformCoordinates(this._target.position, invertParentWorldMatrix);

            this._target.parent = this._parent;
        }
    }
} 