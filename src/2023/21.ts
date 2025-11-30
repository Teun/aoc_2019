import { Coord, Grid, GridPos } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(21,
    async (d, rc, tst: {steps: number}) => {
        const grid = new Grid<string>();
        grid.parseFromString(d, {'S':'S', '#':'#', '.':'.'});
        let locations = new Set<string>();
        [...grid.positions('S')].forEach(c => locations.add(c.pos.name()));
        for (let steps = 0; steps < tst.steps; steps++) {
            const newSet = new Set<string>();
            for (const oldPos of locations) {
                (new Coord(oldPos)).neighbours().filter(p => grid.forCoord(p) == '.' || grid.forCoord(p) == 'S')
                    .forEach(c => newSet.add(c.name()));
            }
            locations = newSet;
        }
        return locations.size;
    }
);

(async () => {
    await rig.test(`...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`, 16, {steps: 6});
    await rig.runPrint({steps:64});
})().then(() => {console.log("Done"); });

