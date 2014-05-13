declare module BABYLON {
    interface IAnimatable {
        animations: Animation[];
    }
    interface ISize {
        width: number;
        height: number;
    }
    class Tools {
        static BaseUrl: string;
        static GetFilename(path: string): string;
        static GetDOMTextContent(element: HTMLElement): string;
        static ToDegrees(angle: number): number;
        static ToRadians(angle: number): number;
        static ExtractMinAndMax(positions: number[], start: number, count: number): {
            minimum: Vector3;
            maximum: Vector3;
        };
        static MakeArray(obj: any, allowsNullUndefined?: boolean): any[];
        static GetPointerPrefix(): string;
        static QueueNewFrame(func: any): void;
        static RequestFullscreen(element: any): void;
        static ExitFullscreen(): void;
        static LoadImage(url: string, onload: any, onerror: any, database: any): HTMLImageElement;
        static LoadFile(url: string, callback: (data: any) => void, progressCallBack?: () => void, database?: any, useArrayBuffer?: boolean): void;
        static ReadFile(fileToLoad: any, callback: any, progressCallBack: any): void;
        static WithinEpsilon(a: number, b: number): boolean;
        static DeepCopy(source: any, destination: any, doNotCopyList?: string[], mustCopyList?: string[]): void;
        static IsEmpty(obj: any): boolean;
        static RegisterTopRootEvents(events: {
            name: string;
            handler: EventListener;
        }[]): void;
        static UnregisterTopRootEvents(events: {
            name: string;
            handler: EventListener;
        }[]): void;
        static GetFps(): number;
        static GetDeltaTime(): number;
        static _MeasureFps(): void;
        static CreateScreenshot(engine: Engine, camera: Camera, size: any): void;
    }
}
