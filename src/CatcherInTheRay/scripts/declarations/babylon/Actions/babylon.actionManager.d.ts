declare module BABYLON {
    class ActionManager {
        static NoneTrigger: number;
        static OnPickTrigger: number;
        static OnPointerOverTrigger: number;
        static OnPointerOutTrigger: number;
        static OnEveryFrameTrigger: number;
        public actions: Action[];
        private _scene;
        constructor(scene: Scene);
        public getScene(): Scene;
        public registerAction(action: Action): Action;
        public processTrigger(trigger: number): void;
        public _getEffectiveTarget(target: any, propertyPath: string): any;
        public _getProperty(propertyPath: string): string;
    }
}
