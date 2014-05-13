declare module BABYLON {
    class Animation {
        public name: string;
        public targetProperty: string;
        public framePerSecond: number;
        public dataType: number;
        public loopMode: number;
        private _keys;
        private _offsetsCache;
        private _highLimitsCache;
        public targetPropertyPath: string[];
        public currentFrame: number;
        constructor(name: string, targetProperty: string, framePerSecond: number, dataType: number, loopMode?: number);
        public getKeys(): any[];
        public floatInterpolateFunction(startValue: number, endValue: number, gradient: number): number;
        public quaternionInterpolateFunction(startValue: Quaternion, endValue: Quaternion, gradient: number): Quaternion;
        public vector3InterpolateFunction(startValue: Vector3, endValue: Vector3, gradient: number): Vector3;
        public color3InterpolateFunction(startValue: Color3, endValue: Color3, gradient: number): Color3;
        public clone(): Animation;
        public setKeys(values: any[]): void;
        private _interpolate(currentFrame, repeatCount, loopMode, offsetValue?, highLimitValue?);
        public animate(target: any, delay: number, from: number, to: number, loop: boolean, speedRatio: number): boolean;
        static ANIMATIONTYPE_FLOAT: number;
        static ANIMATIONTYPE_VECTOR3: number;
        static ANIMATIONTYPE_QUATERNION: number;
        static ANIMATIONTYPE_MATRIX: number;
        static ANIMATIONTYPE_COLOR3: number;
        static ANIMATIONLOOPMODE_RELATIVE: number;
        static ANIMATIONLOOPMODE_CYCLE: number;
        static ANIMATIONLOOPMODE_CONSTANT: number;
    }
}
