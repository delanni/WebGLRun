declare module BABYLON {
    class VertexBuffer {
        private _mesh;
        private _engine;
        private _buffer;
        private _data;
        private _updatable;
        private _kind;
        private _strideSize;
        constructor(mesh: Mesh, data: number[], kind: string, updatable: boolean, engine?: Engine);
        public isUpdatable(): boolean;
        public getData(): number[];
        public getBuffer(): WebGLBuffer;
        public getStrideSize(): number;
        public update(data: number[]): void;
        public dispose(): void;
        static PositionKind: string;
        static NormalKind: string;
        static UVKind: string;
        static UV2Kind: string;
        static ColorKind: string;
        static MatricesIndicesKind: string;
        static MatricesWeightsKind: string;
    }
}
