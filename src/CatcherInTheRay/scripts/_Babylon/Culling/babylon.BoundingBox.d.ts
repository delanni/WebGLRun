declare module BABYLON {
    class BoundingBox {
        public minimum: Vector3;
        public maximum: Vector3;
        public vectors: Vector3[];
        public center: Vector3;
        public extends: Vector3;
        public directions: Vector3[];
        public vectorsWorld: Vector3[];
        public minimumWorld: Vector3;
        public maximumWorld: Vector3;
        constructor(minimum: Vector3, maximum: Vector3);
        public _update(world: Matrix): void;
        public isInFrustum(frustumPlanes: Plane[]): boolean;
        public intersectsPoint(point: Vector3): boolean;
        public intersectsSphere(sphere: BoundingSphere): boolean;
        public intersectsMinMax(min: Vector3, max: Vector3): boolean;
        static Intersects(box0: BoundingBox, box1: BoundingBox): boolean;
        static IsInFrustum(boundingVectors: Vector3[], frustumPlanes: Plane[]): boolean;
    }
}
