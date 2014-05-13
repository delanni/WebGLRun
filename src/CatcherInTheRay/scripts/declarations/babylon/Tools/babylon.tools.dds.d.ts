declare module BABYLON.Internals {
    class DDSTools {
        static GetDDSInfo(arrayBuffer: any): {
            width: number;
            height: number;
            mipmapCount: number;
        };
        static UploadDDSLevels(gl: any, ext: any, arrayBuffer: any, loadMipmaps?: boolean): void;
    }
}
