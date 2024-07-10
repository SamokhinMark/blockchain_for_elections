export class SeedRandom {
    seed;
    a;
    c;
    m;
    state;
    constructor(seed) {
        // Преобразуем строковый seed в число
        this.seed = this.hashString(seed);
        this.a = 1664525;
        this.c = 1013904223;
        this.m = 2 ** 32;
        this.state = this.seed;
    }
    random() {
        this.state = (this.a * this.state + this.c) % this.m;
        return Math.abs(this.state / this.m);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0; // Преобразование в 32-битное целое число
        }
        return hash;
    }
}
