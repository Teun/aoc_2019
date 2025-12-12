import { Rig } from '../main_modules/rig';
import { Coord } from '../main_modules/grid';
import { parseToObjects } from '../main_modules/lineParser';
import { power } from "js-combinatorics";

const rig = new Rig(10, async (input, opt, testOpt) => {
    const machines = parseToObjects(input, /^\[(\S+)\] ((\(\S+\) )+){(\S+)}$/, (m) => {
        return {
            target: m[1],
            buttons: m[2].trim()
                    .split(" ").map(b => b.replace(/[()]/g, "")
                    .split(',').map(Number)),
            jolt: m[4].split(",").map(Number)
        };
    });
    const buttonNrs = machines.map(m => numberOfButtons(m.target, m.buttons));
    return buttonNrs.reduce((a,v)=>a+v, 0);
});

(async () => {
    await rig.test(`[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`, 7);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

function numberOfButtons(targetStr: string, buttons: number[][]): number {
    const target = targetStr.split('').map(c => c === '#');
    const start = target.map(i => false);
    const buttonCombis = power(buttons).toArray();
    buttonCombis.sort((a, b) => a.length - b.length);
    for (const combi of buttonCombis) {
        const res = combi.reduce((a, b) => {
            const arr = [...a];
            for (const n of b) {
                arr[n] = ! a[n];
            }
            return arr;
        }, start);
        if(target.every((v, i, a) => v === res[i])) {
            return combi.length;
        }
    }
}

