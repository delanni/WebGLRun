interface RandomProvider {
    Random: () => number;
}
declare class MersenneTwister implements RandomProvider {
    private N;
    private M;
    private MATRIX_A;
    private UPPER_MASK;
    private LOWER_MASK;
    private mt;
    private mti;
    public Random(): number;
    constructor(seed: number);
    private init_genrand(s);
    private init_by_array(init_key, key_length);
    private genrand_int32();
    private genrand_int31();
    private genrand_real1();
    private random();
    private genrand_real3();
    private genrand_res53();
}
