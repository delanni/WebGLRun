declare module BABYLON {
    interface IFileLoader {
        extensions: string;
        importMesh(meshesNames: any, scene: Scene, data: string, rootUrl: string, meshes: Mesh[], particleSystems: ParticleSystem[], skeletons: Skeleton[]): boolean;
        load(scene: Scene, data: string, rootUrl: string): void;
    }
    class SceneLoader {
        private static _registeredPlugins;
        private static _GetPluginForFilename(sceneFilename);
        static RegisterPlugin(plugin: IFileLoader): void;
        static ImportMesh(meshesNames: any, rootUrl: string, sceneFilename: string, scene: Scene, onsuccess: (meshes: Mesh[], particleSystems: ParticleSystem[], skeletons: Skeleton[]) => void, progressCallBack: () => void, onerror: (scene: Scene) => void): void;
        static Load(rootUrl: string, sceneFilename: any, engine: Engine, onsuccess: (scene: Scene) => void, progressCallBack: () => void, onerror: (scene: Scene) => void): void;
    }
}
