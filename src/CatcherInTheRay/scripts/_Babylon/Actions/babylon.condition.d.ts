﻿declare module BABYLON {
    class Condition {
        public _actionManager: ActionManager;
        public _evaluationId: number;
        public _currentResult: boolean;
        constructor(actionManager: ActionManager);
        public isValid(): boolean;
        public _getProperty(propertyPath: string): string;
        public _getEffectiveTarget(target: any, propertyPath: string): any;
    }
    class StateCondition extends Condition {
        public propertyPath: string;
        public value: any;
        public operator: number;
        static IsEqual: number;
        static IsDifferent: number;
        static IsGreater: number;
        static IsLesser: number;
        public _actionManager: ActionManager;
        private _target;
        private _property;
        constructor(actionManager: ActionManager, target: any, propertyPath: string, value: any, operator?: number);
        public isValid(): boolean;
    }
    class PredicateCondition extends Condition {
        public predicate: () => boolean;
        public _actionManager: ActionManager;
        constructor(actionManager: ActionManager, predicate: () => boolean);
        public isValid(): boolean;
    }
}
