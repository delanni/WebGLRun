declare module BABYLON {
    class IntersectionInfo {
        public bu: number;
        public bv: number;
        public distance: number;
        public faceId: number;
        constructor(bu: number, bv: number, distance: number);
    }
    class PickingInfo {
        public hit: boolean;
        public distance: number;
        public pickedPoint: any;
        public pickedMesh: any;
        public bu: number;
        public bv: number;
        public faceId: number;
        public getNormal(): Vector3;
    }
}
