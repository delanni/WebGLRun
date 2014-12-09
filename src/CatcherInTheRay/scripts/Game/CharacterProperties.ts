module GAME {
    export var MODEL_ANIMATIONS: { [modelName: string]: ICharacterModelDictionary; } = {
        "fox": {
            RUN: {
                start: 1, end: 11, speed: 14, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 5, end: 9, speed: 16, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.25, 0.25, 0.25])
        },
        "wolf": {
            RUN: {
                start: 1, end: 14, speed: 16, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 5, end: 11, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.20, 0.20, 0.20])
        },
        "moose": {
            RUN: {
                start: 1, end: 15, speed: 12, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 7, end: 11, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.10, 0.10, 0.10])
        },
        "deer": {
            RUN: {
                start: 1, end: 16, speed: 16, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 1, end: 11, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.15, 0.15, 0.15])
        },
        "elk": {
            RUN: {
                start: 1, end: 15, speed: 12, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 1, end: 4, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.25, 0.25, 0.25])
        },
        "mountainlion": {
            RUN: {
                start: 1, end: 13, speed: 16, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 1, end: 5, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.15, 0.15, 0.15])
        },
        "chowchow": {
            RUN: {
                start: 1, end: 13, speed: 16, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 5, end: 10, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.25, 0.25, 0.25])
        },
        "goldenRetreiver": {
            RUN: {
                start: 1, end: 12, speed: 16, repeat: true
            },
            STAY: {
                start: 0, end: 1, speed: 0, repeat: false
            },
            JUMP: {
                start: 2, end: 7, speed: 14, repeat: false
            },
            ScalingVector: BABYLON.Vector3.FromArray([0.17, 0.17, 0.17])
        }
    }
}