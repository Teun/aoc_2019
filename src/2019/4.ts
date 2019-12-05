import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
const fit = (nr: number) => {
    const asString = nr.toString();
    let flagDouble = false;
    for (let i = 0; i < asString.length - 1; i++) {
        if (asString[i] > asString[i + 1]) {
            return false;
        }
        if (asString[i] === asString[i + 1]) {
            if (asString[i] !== asString[i + 2] && asString[i] !== asString[i - 1]) {
                flagDouble = true;
            }
        }
    }
    return flagDouble;
};
const rig = new Rig(4,
    async (d) => {
        const from = Number(d.split(",")[0]);
        const to = Number(d.split(",")[1]);
        const result: number[] = [];

        for (let x = from; x <= to; x++) {
            if (fit(x)) {
                result.push(x);
            }
        }

        return result.length;
    }
);
(async (): Promise<void> => {
    await rig.test("111111,111111", 0);
    await rig.test("223450,223450", 0);
    await rig.test("123444,123444", 0);
    await rig.test("111122,111122", 1);
    await rig.testPrint("137683,596253");
})()
.then(() => {console.log("Done"); });
