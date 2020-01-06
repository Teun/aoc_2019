import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const modInvert = (val: bigint, mod: bigint) => {
    return modPower(val, mod - BigInt(2), mod);
};
const modPower = (x: bigint, n: bigint, m: bigint): bigint => {
    if (n === BigInt(0)) { return BigInt(1); }
    if (n % BigInt(2) === BigInt(0)) {
        const t = modPower(x, n / BigInt(2), m);
        return (t * t) % m;
    } else {
        const t = modPower(x, (n - BigInt(1)) / BigInt(2), m);
        return (t * t * x) % m;
    }
};

class Lcf {
    constructor(public a: bigint, public b: bigint, public m: bigint) {
        this.a = a % m;
        this.b = b % m;
    }
    public transform(x: bigint) {
        return (this.a * x + this.b) % this.m;
    }
    public combine(next: Lcf) {
        return new Lcf(this.a * next.a, this.b * next.a + next.b, next.m);
    }
    public invert(): Lcf {
        const invA = modInvert(this.a, this.m);
        return new Lcf(invA, - this.b * invA, this.m);
    }
}
const reverse = (stack: bigint) => {
    return new Lcf(BigInt(-1), stack - BigInt(1), stack);
};
const increment = (inc: bigint, stack: bigint) => {
    return new Lcf(inc, BigInt(0), stack);
};
const cut = (inc: bigint, stack: bigint) => {
    return new Lcf(BigInt(1), -inc, stack);
};
const identity = new Lcf(BigInt(1), BigInt(0), BigInt(Number.MAX_SAFE_INTEGER));

const combineAll = (transforms: Lcf[]) => {
    return transforms.reduce((a, v) => {
        return a.combine(v);
    }, identity);
};
const selfApply = (lcf: Lcf, times: bigint): Lcf => {
    return new Lcf(
        modPower(lcf.a, times, lcf.m),
        lcf.b *
            (modPower(lcf.a, times, lcf.m) - BigInt(1)) *
            modInvert(lcf.a - BigInt(1), lcf.m),
        lcf.m);
};

const rig = new Rig(22,
    async (d, o, ro: {deck: bigint, card: bigint, shuffles: bigint}) => {
        const transforms = parseToObjects(d, /(deal into new stack|deal with increment|cut)\s*([0-9\-]+)?/, (s, n) => {
            if (s[1] === "deal into new stack") {
                return reverse(ro.deck);
            }
            if (s[1] === "deal with increment") {
                return increment(BigInt(s[2]), ro.deck);
            }
            if (s[1] === "cut") {
                return cut(BigInt(s[2]), ro.deck);
            }
            return identity;
        });

        const bigF = combineAll(transforms);
        const bigFk = selfApply(bigF, ro.shuffles);
        const bigFkInverse = bigFk.invert();
        return bigFkInverse.transform(ro.card).toString();
    }
);
(async () => {
    await rig.runPrint({deck: BigInt(10007), card: BigInt(8191), shuffles: BigInt(1)});
    await rig.runPrint({deck: BigInt(119315717514047), card: BigInt(2020), shuffles: BigInt(101741582076661)});
})().then(() => {console.log("Done"); });
