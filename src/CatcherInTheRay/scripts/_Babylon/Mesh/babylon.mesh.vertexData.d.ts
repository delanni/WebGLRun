declare module BABYLON {
    class VertexData {
        public positions: number[];
        public normals: number[];
        public uvs: number[];
        public uv2s: number[];
        public colors: number[];
        public matricesIndices: number[];
        public matricesWeights: number[];
        public indices: number[];
        public applyToMesh(mesh: Mesh, updatable?: boolean): void;
        public transform(matrix: Matrix): void;
        public merge(other: VertexData): void;
        static ExtractFromMesh(mesh: Mesh): VertexData;
        static CreateBox(size: number): VertexData;
        static CreateSphere(segments: number, diameter: number): VertexData;
        static CreateCylinder(height: number, diameterTop: number, diameterBottom: number, tessellation: number): VertexData;
        static CreateTorus(diameter: any, thickness: any, tessellation: any): VertexData;
        static CreateGround(width: number, height: number, subdivisions: number): VertexData;
        static CreateGroundFromHeightMap(width: number, height: number, subdivisions: number, minHeight: number, maxHeight: number, buffer: Uint8Array, bufferWidth: number, bufferHeight: number): VertexData;
        static CreatePlane(size: number): VertexData;
        static CreateTorusKnot(radius: number, tube: number, radialSegments: number, tubularSegments: number, p: number, q: number): VertexData;
        static ComputeNormals(positions: number[], indices: number[], normals: number[]): void;
    }
}
