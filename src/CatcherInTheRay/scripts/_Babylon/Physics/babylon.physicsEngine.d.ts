declare module BABYLON {
    interface PhysicsEnginePlugin {
        initialize(iterations?: number): any;
        setGravity(gravity: Vector3): void;
        runOneStep(delta: number): void;
        registerMesh(mesh: Mesh, impostor: number, options: PhysicsBodyCreationOptions): any;
        registerMeshesAsCompound(parts: PhysicsCompoundBodyPart[], options: PhysicsBodyCreationOptions): any;
        unregisterMesh(mesh: Mesh): any;
        applyImpulse(mesh: Mesh, force: Vector3, contactPoint: Vector3): void;
        createLink(mesh1: Mesh, mesh2: Mesh, pivot1: Vector3, pivot2: Vector3): boolean;
        dispose(): void;
        isSupported(): boolean;
    }
    interface PhysicsBodyCreationOptions {
        mass: number;
        friction: number;
        restitution: number;
    }
    interface PhysicsCompoundBodyPart {
        mesh: Mesh;
        impostor: number;
    }
    class PhysicsEngine {
        public gravity: Vector3;
        private _currentPlugin;
        constructor(plugin?: PhysicsEnginePlugin);
        public _initialize(gravity?: Vector3): void;
        public _runOneStep(delta: number): void;
        public _setGravity(gravity: Vector3): void;
        public _registerMesh(mesh: Mesh, impostor: number, options: PhysicsBodyCreationOptions): any;
        public _registerMeshesAsCompound(parts: PhysicsCompoundBodyPart[], options: PhysicsBodyCreationOptions): any;
        public _unregisterMesh(mesh: Mesh): void;
        public _applyImpulse(mesh: Mesh, force: Vector3, contactPoint: Vector3): void;
        public _createLink(mesh1: Mesh, mesh2: Mesh, pivot1: Vector3, pivot2: Vector3): boolean;
        public dispose(): void;
        public isSupported(): boolean;
        static NoImpostor: number;
        static SphereImpostor: number;
        static BoxImpostor: number;
        static PlaneImpostor: number;
        static CompoundImpostor: number;
        static MeshImpostor: number;
        static Epsilon: number;
    }
}
