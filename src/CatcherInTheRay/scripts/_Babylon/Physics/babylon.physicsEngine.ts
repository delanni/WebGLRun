﻿module BABYLON {
    declare var CANNON;

    export interface PhysicsEnginePlugin {
        initialize(iterations?: number);
        setGravity(gravity: Vector3): void;
        runOneStep(delta: number): void;
        registerMesh(mesh: Mesh, impostor: number, options: PhysicsBodyCreationOptions): any;
        registerMeshesAsCompound(parts: PhysicsCompoundBodyPart[], options: PhysicsBodyCreationOptions): any;
        unregisterMesh(mesh: Mesh);
        applyImpulse(mesh: Mesh, force: Vector3, contactPoint: Vector3): void;
        createLink(mesh1: Mesh, mesh2: Mesh, pivot1: Vector3, pivot2: Vector3): boolean;
        dispose(): void;
        isSupported(): boolean;
    }

    export interface PhysicsBodyCreationOptions {
        mass: number;
        friction: number;
        restitution: number;
    }

    export interface PhysicsCompoundBodyPart {
        mesh: Mesh;
        impostor: number;
    }

    export class PhysicsEngine {
        public gravity: Vector3;

        private _currentPlugin: PhysicsEnginePlugin;

        constructor(plugin?: PhysicsEnginePlugin) {
            this._currentPlugin = plugin || new CannonJSPlugin();
        }

        public _initialize(gravity?: Vector3) {
            this._currentPlugin.initialize();
            this._setGravity(gravity);
        }

        public _runOneStep(delta: number): void {
            if (delta > 0.1) {
                delta = 0.1;
            } else if (delta <= 0) {
                delta = 1.0 / 60.0;
            }

            this._currentPlugin.runOneStep(delta);
        }

        public _setGravity(gravity: Vector3): void {
            this.gravity = gravity || new BABYLON.Vector3(0, -9.82, 0);
            this._currentPlugin.setGravity(this.gravity);
        }

        public _registerMesh(mesh: Mesh, impostor: number, options: PhysicsBodyCreationOptions): any {
            return this._currentPlugin.registerMesh(mesh, impostor, options);
        }

        public _registerMeshesAsCompound(parts: PhysicsCompoundBodyPart[], options: PhysicsBodyCreationOptions): any {
            return this._currentPlugin.registerMeshesAsCompound(parts, options);
        }

        public _unregisterMesh(mesh: Mesh): void {
            this._currentPlugin.unregisterMesh(mesh);
        }

        public _applyImpulse(mesh: Mesh, force: Vector3, contactPoint: Vector3): void {
            this._currentPlugin.applyImpulse(mesh, force, contactPoint);
        }

        public _createLink(mesh1: Mesh, mesh2: Mesh, pivot1: Vector3, pivot2: Vector3): boolean {
            return this._currentPlugin.createLink(mesh1, mesh2, pivot1, pivot2);
        }

        public dispose(): void {
            this._currentPlugin.dispose();
        }

        public isSupported(): boolean {
            return this._currentPlugin.isSupported();
        }

        // Statics
        public static NoImpostor = 0;
        public static SphereImpostor = 1;
        public static BoxImpostor = 2;
        public static PlaneImpostor = 3;
        public static CompoundImpostor = 4;
        public static MeshImpostor = 4;
        public static Epsilon = 0.001;
    }
}