import { parseToObjects } from "./modules/lineParser";
import {Rig} from "./modules/rig";

const rig = new Rig(1,
    async (d) => {
        const values = parseToObjects(d, /\w+/, (s, n) => {
            var allDigits = [... s[0].match(/\d/g)];
            return Number(allDigits[0] + allDigits[allDigits.length-1]);
        });
        return values.reduce((a, v) => a + v, 0);
    }
);

(async () => {
    await rig.test(`1abc2
    pqr3stu8vwx
    a1b2c3d4e5f
    treb7uchet`, 142);
    await rig.runPrint();
})().then(() => {console.log("Done"); });
