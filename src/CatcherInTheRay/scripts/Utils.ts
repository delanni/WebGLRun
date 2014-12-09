module UTILS {

    export function Clamp(scalar: number, min: number, max: number) {
        return Math.max(Math.min(scalar, max), min);
    }

    export function Mixin(mixThis, toThis, dontTouchExistingProperties) {
        var f = dontTouchExistingProperties;
        var fromKeys = Object.keys(mixThis);
        var toKeys = Object.keys(toThis);

        for (var i = 0; i < fromKeys.length; i++) {
            var key = fromKeys[i];
            if (toThis.hasOwnProperty(key) && f) continue;
            else {
                if (toThis[key] instanceof Object && mixThis[key] instanceof Object) {
                    Mixin(mixThis[key], toThis[key], f);
                } else {
                    if (mixThis[key] !== "undedfined" && mixThis[key] !== null) {
                        toThis[key] = mixThis[key];
                    }
                }
            }
        }
        return toThis;
    }
} 