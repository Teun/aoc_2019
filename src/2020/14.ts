import * as Long from "long";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
class Op {
    constructor(public type: string, public loc: number, public value: string) {}
}

class Mask {
    // tslint:disable-next-line:no-any
    private _ones: any;
    // tslint:disable-next-line:no-any
    private _zeroes: any;
    constructor(msk: string) {
        this._ones = Long.fromString(msk.replace(/[X0]/g, "0"), 2);
        this._zeroes = Long.fromString(msk.replace(/[X1]/g, "1"), 2);
    }
    public mask(val: number) {
        // tslint:disable-next-line:no-bitwise
        return this._zeroes.and(val).or(this._ones).toNumber();
    }
}

const rig = new Rig(14, async (d) => {
    const ops = parseToObjects(d, /(?<tt>mask|mem)(\[(?<loc>\d+)\])? = (?<val>\w+)/, (s) => {
        // tslint:disable-next-line:no-string-literal
        return new Op(s[1], Number(s[3]), s[4]);
    });
    const mem: {[key: number]: number} = {};
    let mask: Mask;
    for (const op of ops) {
        if (op.type === "mask") {
            mask = new Mask(op.value);
        }
        if (op.type === "mem") {
            mem[op.loc] = mask.mask(Number(op.value));
        }
    }
    return Object.keys(mem).reduce((a, v) => a + mem[v], 0);
});
(async (): Promise<void> => {
    await rig.testFromFile("1", 165);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
