module UTILS {
    export class Utils {
        public static Clamp(scalar: number, min: number, max: number) {
            return Math.max(Math.min(scalar, max),min);
        }
    }
} 