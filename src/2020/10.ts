import { firstBy } from "thenby";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(10, async (d) => {
    const numbers = parseToObjects(d, /\d+/, (s) => parseInt(s[0], 10));
    const sorted = numbers.sort(firstBy(Number));
    sorted.unshift(0);
    sorted.push(sorted[sorted.length - 1] + 3);
    const deltas = sorted.slice(1).map((n, i) => n - sorted[i]);
    const stat = deltas.reduce((a, v) => {
        a[v] = 1 + (a[v] || 0);
        return a;
    }, {});
    return stat[1] * stat[3];
});
(async (): Promise<void> => {
    await rig.test("16\n10\n15\n5\n1\n11\n7\n19\n6\n12\n4", 35);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
