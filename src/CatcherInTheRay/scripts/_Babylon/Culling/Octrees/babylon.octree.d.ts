declare module BABYLON {
    interface IOctreeContainer {
        blocks: OctreeBlock[];
    }
    class Octree {
        public blocks: OctreeBlock[];
        private _maxBlockCapacity;
        private _selection;
        constructor(maxBlockCapacity?: number);
        public update(worldMin: Vector3, worldMax: Vector3, meshes: any): void;
        public addMesh(mesh: any): void;
        public select(frustumPlanes: Plane[]): any;
        static _CreateBlocks(worldMin: Vector3, worldMax: Vector3, meshes: any, maxBlockCapacity: number, target: IOctreeContainer): void;
    }
}
