import { firstBy } from "thenby";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const rig = new Rig(10, async (d) => {
    const numbers = parseToObjects(d, /\d+/, (s) => parseInt(s[0], 10));
    const sorted = numbers.sort(firstBy(Number));
    sorted.unshift(0);
    sorted.push(sorted[sorted.length - 1] + 3);
    const pathsTo: {[key: number]: number} = {};
    pathsTo[0] = 1;
    let current = 1;
    while (current < sorted.length) {
        const result = [];
        for (let index = current - 3; index < current; index++) {
            if (index >= 0 && sorted[current] - sorted[index] <= 3) {
                pathsTo[current] = (pathsTo[current] || 0) + pathsTo[index];
            }
        }
        current++;
    }
    return pathsTo[sorted.length - 1];
});
(async (): Promise<void> => {
    await rig.test("16\n10\n15\n5\n1\n11\n7\n19\n6\n12\n4", 8);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
