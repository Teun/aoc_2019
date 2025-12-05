import { Rig } from '../main_modules/rig';
import { parseToObjects } from '../main_modules/lineParser';

const inRange = (n: number, ranges: number[][]) => {
    for(let range of ranges) {
        if(n >= range[0] && n <= range[1]) return true;
    }
    return false;
}

const rig = new Rig(5, async (input, opt, testOpt) => {
    let parts = input.split('\n\n');
    let ranges = parseToObjects(parts[0], /(\d+)-(\d+)/, (m) => [Number(m[1]), Number(m[2])]);
    let numbers = parts[1].split('\n').map(Number);
    return numbers.filter(n => inRange(n, ranges)).length;
});

(async () => {
    await rig.test(`3-5
10-14
16-20
12-18

1
5
8
11
17
32`, 3);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

