﻿module BABYLON {
    export class MultiMaterial extends Material {
        public subMaterials = new Array<Material>();

        constructor(name: string, scene: Scene) {
            super(name, scene, true);

            scene.multiMaterials.push(this);
        }

        // Properties
        public getSubMaterial(index) {
            if (index < 0 || index >= this.subMaterials.length) {
                return this.getScene().defaultMaterial;
            }

            return this.subMaterials[index];
        }

        // Methods
        public isReady(mesh?: Mesh): boolean {
            for (var index = 0; index < this.subMaterials.length; index++) {
                var subMaterial = this.subMaterials[index];
                if (subMaterial) {
                    if (!this.subMaterials[index].isReady(mesh)) {
                        return false;
                    }
                }
            }

            return true;
        }
    }
} 