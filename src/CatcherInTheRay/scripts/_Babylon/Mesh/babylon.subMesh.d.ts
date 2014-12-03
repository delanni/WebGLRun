declare module BABYLON {
    class SubMesh {
        public materialIndex: number;
        public verticesStart: number;
        public verticesCount: number;
        public indexStart: any;
        public indexCount: number;
        public linesIndexCount: number;
        private _mesh;
        private _boundingInfo;
        private _linesIndexBuffer;
        public _lastColliderWorldVertices: Vector3[];
        public _trianglePlanes: Plane[];
        public _lastColliderTransformMatrix: Matrix;
        constructor(materialIndex: number, verticesStart: number, verticesCount: number, indexStart: any, indexCount: number, mesh: Mesh);
        public getBoundingInfo(): BoundingInfo;
        public getMesh(): Mesh;
        public getMaterial(): Material;
        public refreshBoundingInfo(): void;
        public _checkCollision(collider: Collider): boolean;
        public updateBoundingInfo(world: Matrix): void;
        public isInFrustum(frustumPlanes: Plane[]): boolean;
        public render(): void;
        public getLinesIndexBuffer(indices: number[], engine: any): WebGLBuffer;
        public canIntersects(ray: Ray): boolean;
        public intersects(ray: Ray, positions: Vector3[], indices: number[], fastCheck?: boolean): IntersectionInfo;
        public clone(newMesh: Mesh): SubMesh;
        static CreateFromIndices(materialIndex: number, startIndex: number, indexCount: number, mesh: Mesh): SubMesh;
    }
}
