﻿module BABYLON {
    export class Texture extends BaseTexture {
        // Constants
        public static NEAREST_SAMPLINGMODE = 1;
        public static BILINEAR_SAMPLINGMODE = 2;
        public static TRILINEAR_SAMPLINGMODE = 3;

        public static EXPLICIT_MODE = 0;
        public static SPHERICAL_MODE = 1;
        public static PLANAR_MODE = 2;
        public static CUBIC_MODE = 3;
        public static PROJECTION_MODE = 4;
        public static SKYBOX_MODE = 5;

        public static CLAMP_ADDRESSMODE = 0;
        public static WRAP_ADDRESSMODE = 1;
        public static MIRROR_ADDRESSMODE = 2;

        // Members
        public name: string;
        public url: string;
        public uOffset = 0;
        public vOffset = 0;
        public uScale = 1.0;
        public vScale = 1.0;
        public uAng = 0;
        public vAng = 0;
        public wAng = 0;
        public wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        public wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        public coordinatesIndex = 0;
        public coordinatesMode = BABYLON.Texture.EXPLICIT_MODE;
        public anisotropicFilteringLevel = 4;
        public animations = new Array<Animation>();
        public isRenderTarget = false;

        private _noMipmap: boolean;
        public _invertY: boolean;
        private _rowGenerationMatrix: Matrix;
        private _cachedTextureMatrix: Matrix;
        private _projectionModeMatrix: Matrix;
        private _t0: Vector3;
        private _t1: Vector3;
        private _t2: Vector3;

        public _cachedAnisotropicFilteringLevel: number;
        private _cachedUOffset: number;
        private _cachedVOffset: number;
        private _cachedUScale: number;
        private _cachedVScale: number;
        private _cachedUAng: number;
        private _cachedVAng: number;
        private _cachedWAng: number;
        private _cachedCoordinatesMode: number;

        constructor(url: string, scene: Scene, noMipmap?: boolean, invertY?: boolean) {
            super(scene);

            this.name = url;
            this.url = url;
            this._noMipmap = noMipmap;
            this._invertY = invertY;

            if (!url) {
                return;
            }

            this._texture = this._getFromCache(url, noMipmap);

            if (!this._texture) {
                if (!scene.useDelayedTextureLoading) {
                    this._texture = scene.getEngine().createTexture(url, noMipmap, invertY, scene);
                } else {
                    this.delayLoadState = BABYLON.Engine.DELAYLOADSTATE_NOTLOADED;
                }
            }
        }

        public delayLoad(): void {
            if (this.delayLoadState != BABYLON.Engine.DELAYLOADSTATE_NOTLOADED) {
                return;
            }

            this.delayLoadState = BABYLON.Engine.DELAYLOADSTATE_LOADED;
            this._texture = this._getFromCache(this.url, this._noMipmap);

            if (!this._texture) {
                this._texture = this.getScene().getEngine().createTexture(this.url, this._noMipmap, this._invertY, this.getScene());
            }
        }

        private _prepareRowForTextureGeneration(x: number, y: number, z: number, t: Vector3): void {
            x -= this.uOffset + 0.5;
            y -= this.vOffset + 0.5;
            z -= 0.5;

            Vector3.TransformCoordinatesFromFloatsToRef(x, y, z, this._rowGenerationMatrix, t);

            t.x *= this.uScale;
            t.y *= this.vScale;

            t.x += 0.5;
            t.y += 0.5;
            t.z += 0.5;
        }

        public _computeTextureMatrix(): Matrix {
            if (
                this.uOffset === this._cachedUOffset &&
                this.vOffset === this._cachedVOffset &&
                this.uScale === this._cachedUScale &&
                this.vScale === this._cachedVScale &&
                this.uAng === this._cachedUAng &&
                this.vAng === this._cachedVAng &&
                this.wAng === this._cachedWAng) {
                return this._cachedTextureMatrix;
            }

            this._cachedUOffset = this.uOffset;
            this._cachedVOffset = this.vOffset;
            this._cachedUScale = this.uScale;
            this._cachedVScale = this.vScale;
            this._cachedUAng = this.uAng;
            this._cachedVAng = this.vAng;
            this._cachedWAng = this.wAng;

            if (!this._cachedTextureMatrix) {
                this._cachedTextureMatrix = BABYLON.Matrix.Zero();
                this._rowGenerationMatrix = new BABYLON.Matrix();
                this._t0 = BABYLON.Vector3.Zero();
                this._t1 = BABYLON.Vector3.Zero();
                this._t2 = BABYLON.Vector3.Zero();
            }

            BABYLON.Matrix.RotationYawPitchRollToRef(this.vAng, this.uAng, this.wAng, this._rowGenerationMatrix);

            this._prepareRowForTextureGeneration(0, 0, 0, this._t0);
            this._prepareRowForTextureGeneration(1.0, 0, 0, this._t1);
            this._prepareRowForTextureGeneration(0, 1.0, 0, this._t2);

            this._t1.subtractInPlace(this._t0);
            this._t2.subtractInPlace(this._t0);

            BABYLON.Matrix.IdentityToRef(this._cachedTextureMatrix);
            this._cachedTextureMatrix.m[0] = this._t1.x; this._cachedTextureMatrix.m[1] = this._t1.y; this._cachedTextureMatrix.m[2] = this._t1.z;
            this._cachedTextureMatrix.m[4] = this._t2.x; this._cachedTextureMatrix.m[5] = this._t2.y; this._cachedTextureMatrix.m[6] = this._t2.z;
            this._cachedTextureMatrix.m[8] = this._t0.x; this._cachedTextureMatrix.m[9] = this._t0.y; this._cachedTextureMatrix.m[10] = this._t0.z;

            return this._cachedTextureMatrix;
        }

        public _computeReflectionTextureMatrix(): Matrix {
            if (
                this.uOffset === this._cachedUOffset &&
                this.vOffset === this._cachedVOffset &&
                this.uScale === this._cachedUScale &&
                this.vScale === this._cachedVScale &&
                this.coordinatesMode === this._cachedCoordinatesMode) {
                return this._cachedTextureMatrix;
            }

            if (!this._cachedTextureMatrix) {
                this._cachedTextureMatrix = BABYLON.Matrix.Zero();
                this._projectionModeMatrix = BABYLON.Matrix.Zero();
            }

            switch (this.coordinatesMode) {
                case BABYLON.Texture.SPHERICAL_MODE:
                    BABYLON.Matrix.IdentityToRef(this._cachedTextureMatrix);
                    this._cachedTextureMatrix[0] = -0.5 * this.uScale;
                    this._cachedTextureMatrix[5] = -0.5 * this.vScale;
                    this._cachedTextureMatrix[12] = 0.5 + this.uOffset;
                    this._cachedTextureMatrix[13] = 0.5 + this.vOffset;
                    break;
                case BABYLON.Texture.PLANAR_MODE:
                    BABYLON.Matrix.IdentityToRef(this._cachedTextureMatrix);
                    this._cachedTextureMatrix[0] = this.uScale;
                    this._cachedTextureMatrix[5] = this.vScale;
                    this._cachedTextureMatrix[12] = this.uOffset;
                    this._cachedTextureMatrix[13] = this.vOffset;
                    break;
                case BABYLON.Texture.PROJECTION_MODE:
                    BABYLON.Matrix.IdentityToRef(this._projectionModeMatrix);

                    this._projectionModeMatrix.m[0] = 0.5;
                    this._projectionModeMatrix.m[5] = -0.5;
                    this._projectionModeMatrix.m[10] = 0.0;
                    this._projectionModeMatrix.m[12] = 0.5;
                    this._projectionModeMatrix.m[13] = 0.5;
                    this._projectionModeMatrix.m[14] = 1.0;
                    this._projectionModeMatrix.m[15] = 1.0;

                    this.getScene().getProjectionMatrix().multiplyToRef(this._projectionModeMatrix, this._cachedTextureMatrix);
                    break;
                default:
                    BABYLON.Matrix.IdentityToRef(this._cachedTextureMatrix);
                    break;
            }
            return this._cachedTextureMatrix;
        }

        public clone(): Texture {
            var newTexture = new BABYLON.Texture(this._texture.url, this.getScene(), this._noMipmap, this._invertY);

            // Base texture
            newTexture.hasAlpha = this.hasAlpha;
            newTexture.level = this.level;

            // Texture
            newTexture.uOffset = this.uOffset;
            newTexture.vOffset = this.vOffset;
            newTexture.uScale = this.uScale;
            newTexture.vScale = this.vScale;
            newTexture.uAng = this.uAng;
            newTexture.vAng = this.vAng;
            newTexture.wAng = this.wAng;
            newTexture.wrapU = this.wrapU;
            newTexture.wrapV = this.wrapV;
            newTexture.coordinatesIndex = this.coordinatesIndex;
            newTexture.coordinatesMode = this.coordinatesMode;

            return newTexture;
        }
    }
} 