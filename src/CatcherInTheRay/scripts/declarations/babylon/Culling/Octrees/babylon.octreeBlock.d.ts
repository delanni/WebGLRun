declare module BABYLON {
    class OctreeBlock {
        public meshes: Mesh[];
        public subMeshes: SubMesh[][];
        public blocks: OctreeBlock[];
        private _capacity;
        private _minPoint;
        private _maxPoint;
        private _boundingVectors;
        constructor(minPoint: Vector3, maxPoint: Vector3, capacity: number);
        public addMesh(mesh: Mesh): void;
        public addEntries(meshes: Mesh[]): void;
        public select(frustumPlanes: Plane[], selection: OctreeBlock[]): void;
    }
}
