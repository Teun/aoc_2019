import { Rig } from '../main_modules/rig';
import { Grid } from '../main_modules/grid';
const rig = new Rig(4, async (input, opt, testOpt) => {
    const g = new Grid<string>();
    g.parseFromString(input, {"@": "@", '.': "."});

    let removedSum = 0;
    while(true){
        let removed = removeRolls(g);
        removedSum += removed;
        if(removed === 0) break;
    }
    const txt = g.toString();
    return removedSum;
});

const removeRolls = (grid: Grid<string>): number => {
    const rollsToRemove = removeableRolls(grid);
    for (const roll of rollsToRemove) {
        grid.at(roll.pos).val = '.';
    }
    return rollsToRemove.length;
}
const removeableRolls = (grid: Grid<string>) =>{
    const pos = [...grid.positions()]
        .filter(p => p.val == '@')
        .filter(p => p.pos.neigboursDiag()
                        .filter(nb => grid.forCoord(nb) == '@')
                        .length < 4);
    return pos;

}
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
@.@.@@@.@.`, 43);
    await rig.runPrint();
})().then(() => {console.log("Done"); });

