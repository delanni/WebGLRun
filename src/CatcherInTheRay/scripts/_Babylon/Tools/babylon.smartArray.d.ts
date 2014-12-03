declare module BABYLON {
    class SmartArray {
        public data: any[];
        public length: number;
        constructor(capacity: number);
        public push(value: any): void;
        public pushNoDuplicate(value: any): void;
        public sort(compareFn: any): void;
        public reset(): void;
        public concat(array: SmartArray): void;
        public concatWithNoDuplicate(array: SmartArray): void;
        public indexOf(value: any): number;
    }
}
