import { Rig } from '../main_modules/rig';
import { Grid } from '../main_modules/grid';
const rig = new Rig(4, async (input, opt, testOpt) => {
    const g = new Grid<string>();
    g.parseFromString(input, {"@": "@", '.': "."});

    const pos = [...g.positions()]
        .filter(p => p.val == '@')
        .filter(p => p.pos.neigboursDiag()
                        .filter(nb => g.forCoord(nb) == '@')
                        .length < 4);
    return pos.length;
});

(async () => {
    await rig.test(`..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`, 13);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

