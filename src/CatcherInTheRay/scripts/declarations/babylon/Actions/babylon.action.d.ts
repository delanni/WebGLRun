declare module BABYLON {
    class Action {
        public trigger: number;
        public _actionManager: ActionManager;
        private _nextActiveAction;
        private _child;
        private _condition;
        constructor(trigger: number, condition?: Condition);
        public _prepare(): void;
        public _executeCurrent(): void;
        public execute(): void;
        public then(action: Action): Action;
        public _getProperty(propertyPath: string): string;
        public _getEffectiveTarget(target: any, propertyPath: string): any;
    }
}
