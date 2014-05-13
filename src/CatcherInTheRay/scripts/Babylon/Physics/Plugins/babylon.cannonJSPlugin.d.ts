﻿declare module BABYLON {
    class CannonJSPlugin {
        public checkWithEpsilon: (value: number) => number;
        private _world;
        private _registeredMeshes;
        private _physicsMaterials;
        public initialize(iterations?: number): void;
        private _checkWithEpsilon(value);
        public runOneStep(delta: number): void;
        public setGravity(gravity: Vector3): void;
        public registerMesh(mesh: Mesh, impostor: number, options?: PhysicsBodyCreationOptions): any;
        private _createSphere(radius, mesh, options?);
        private _createBox(x, y, z, mesh, options?);
        private _createPlane(mesh, options?);
        private _createConvexPolyhedron(rawVerts, rawFaces, mesh, options?);
        private _addMaterial(friction, restitution);
        private _createRigidBodyFromShape(shape, mesh, mass, friction, restitution);
        public registerMeshesAsCompound(parts: PhysicsCompoundBodyPart[], options: PhysicsBodyCreationOptions): any;
        private _unbindBody(body);
        public unregisterMesh(mesh: Mesh): void;
        public applyImpulse(mesh: Mesh, force: Vector3, contactPoint: Vector3): void;
        public createLink(mesh1: Mesh, mesh2: Mesh, pivot1: Vector3, pivot2: Vector3): boolean;
        public dispose(): void;
        public isSupported(): boolean;
    }
}
