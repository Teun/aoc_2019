import { Rig } from '../main_modules/rig';
import { Coord } from '../main_modules/grid';
import { parseToObjects } from '../main_modules/lineParser';
import { bigCombination, combination } from "js-combinatorics";

const rig = new Rig(9, async (input, opt, testOpt) => {
    const corners = parseToObjects(input, /(\d+),(\d+)/,
            (l) => new Coord(parseInt(l[1]), parseInt(l[2])));
    const pairs = bigCombination(corners, 2).toArray();
    pairs.sort((a, b) => {
        const srfA = surface(a[0], a[1]);
        const srfB = surface(b[0], b[1]);
        return srfB - srfA;
    });
    return surface(pairs[0][0], pairs[0][1]);
});

(async () => {
    await rig.test(`7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`, 50);
    await rig.runPrint(1000);
})().then(() => {console.log("Done"); });

function surface(corner1: Coord, corner2: Coord) {
    return (Math.abs(corner1.x-corner2.x) + 1) * (Math.abs(corner1.y-corner2.y) + 1);
}

