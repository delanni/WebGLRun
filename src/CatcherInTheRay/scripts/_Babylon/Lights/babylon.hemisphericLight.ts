﻿module BABYLON {
    export class HemisphericLight extends Light {
        public groundColor = new BABYLON.Color3(0.0, 0.0, 0.0);

        private _worldMatrix: Matrix;

        constructor(name: string, public direction: Vector3, scene: Scene) {
            super(name, scene);
        }

        public setDirectionToTarget(target: Vector3): Vector3 {
            this.direction = BABYLON.Vector3.Normalize(target.subtract(Vector3.Zero()));
            return this.direction;
        }

        public getShadowGenerator(): ShadowGenerator {
            return null;
        }

        public transferToEffect(effect: Effect, directionUniformName: string, groundColorUniformName: string): void {
            var normalizeDirection = BABYLON.Vector3.Normalize(this.direction);
            effect.setFloat4(directionUniformName, normalizeDirection.x, normalizeDirection.y, normalizeDirection.z, 0);
            effect.setColor3(groundColorUniformName, this.groundColor.scale(this.intensity));
        }

        public _getWorldMatrix(): Matrix {
            if (!this._worldMatrix) {
                this._worldMatrix = BABYLON.Matrix.Identity();
            }

            return this._worldMatrix;
        }
    }
} 