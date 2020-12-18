import * as Long from "long";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
class Op {
    constructor(public type: string, public loc: number, public value: string) {}
}

class Mask {
    // tslint:disable-next-line:no-any
    private _ones: Long;
    // tslint:disable-next-line:no-any
    private _zeroes: Long;
    constructor(msk: string) {
        this._ones = Long.fromString(msk.replace(/[*0]/g, "0"), 2);
        this._zeroes = Long.fromString(msk.replace(/[*1]/g, "1"), 2);
    }
    public mask(val: number) {
        // tslint:disable-next-line:no-bitwise
        return this._zeroes.and(val).or(this._ones).toNumber();
    }
}
function getAllMasks(val: string) {
    const mask = val.replace(/0/g, "*");
    return [...getMasks(mask)];
}
function* getMasks(val: string): Generator<Mask> {
    const ix = val.indexOf("X");
    if (ix === -1) { return yield new Mask(val); }
    yield* getMasks(val.substring(0, ix) + "0" + val.substring(ix + 1));
    yield* getMasks(val.substring(0, ix) + "1" + val.substring(ix + 1));
}
const rig = new Rig(14, async (d) => {
    const ops = parseToObjects(d, /(?<tt>mask|mem)(\[(?<loc>\d+)\])? = (?<val>\w+)/, (s) => {
        // tslint:disable-next-line:no-string-literal
        return new Op(s[1], Number(s[3]), s[4]);
    });
    const mem: {[key: number]: number} = {};
    let masks: Mask[];
    for (const op of ops) {
        if (op.type === "mask") {
            masks = getAllMasks(op.value);
        }
        if (op.type === "mem") {
            masks.forEach((mask) => {
                mem[mask.mask(op.loc)] = Number(op.value);
            });
        }
    }
    return Object.keys(mem).reduce((a, v) => a + mem[v], 0);
});
(async (): Promise<void> => {
    await rig.testFromFile("2", 208);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
