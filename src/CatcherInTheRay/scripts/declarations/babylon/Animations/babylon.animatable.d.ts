declare module BABYLON.Internals {
    class Animatable {
        public target: any;
        public fromFrame: number;
        public toFrame: number;
        public loopAnimation: boolean;
        public speedRatio: number;
        public onAnimationEnd: any;
        private _localDelayOffset;
        private _animations;
        public animationStarted: boolean;
        constructor(target: any, fromFrame?: number, toFrame?: number, loopAnimation?: boolean, speedRatio?: number, onAnimationEnd?: any, animations?: any);
        public _animate(delay: number): boolean;
    }
}
