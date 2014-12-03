declare module BABYLON {
    class SwitchBooleanAction extends Action {
        public propertyPath: string;
        private _target;
        private _property;
        constructor(trigger: number, target: any, propertyPath: string, condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
    class SetValueAction extends Action {
        public propertyPath: string;
        public value: any;
        private _target;
        private _property;
        constructor(trigger: number, target: any, propertyPath: string, value: any, condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
    class IncrementValueAction extends Action {
        public propertyPath: string;
        public value: any;
        private _target;
        private _property;
        constructor(trigger: number, target: any, propertyPath: string, value: any, condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
    class PlayAnimationAction extends Action {
        public from: number;
        public to: number;
        public loop: boolean;
        private _target;
        constructor(trigger: number, target: any, from: number, to: number, loop?: boolean, condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
    class StopAnimationAction extends Action {
        private _target;
        constructor(trigger: number, target: any, condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
    class DoNothingAction extends Action {
        constructor(trigger?: number, condition?: Condition);
        public execute(): void;
    }
    class CombineAction extends Action {
        public children: Action[];
        constructor(trigger: number, children: Action[], condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
    class ExecuteCodeAction extends Action {
        public func: () => void;
        constructor(trigger: number, func: () => void, condition?: Condition);
        public execute(): void;
    }
    class SetParentAction extends Action {
        private _parent;
        private _target;
        constructor(trigger: number, target: any, parent: any, condition?: Condition);
        public _prepare(): void;
        public execute(): void;
    }
}
