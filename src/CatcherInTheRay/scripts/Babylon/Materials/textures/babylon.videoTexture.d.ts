declare module BABYLON {
    class VideoTexture extends Texture {
        public video: HTMLVideoElement;
        private _autoLaunch;
        private _lastUpdate;
        constructor(name: string, urls: any, size: any, scene: any, generateMipMaps: any, invertY: any);
        public update(): boolean;
    }
}
