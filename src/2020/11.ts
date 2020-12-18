import { firstBy } from "thenby";
import { Grid } from "./modules/grid";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

const evolve = (g: Grid<string>) => {
    const neighbourCount: {[key: string]: number} = {};
    for (const seat of g.positions("#")) {
        seat.pos.neigboursDiag().forEach((p) => {
            neighbourCount[p.name()] = (neighbourCount[p.name()] || 0) + 1;
        });
    }
    for (const seat of g.positionsFunc((s) => s === "#" || s === "L")) {
        if (!neighbourCount[seat.pos.name()]) {
            g.set(seat.pos, "#");
            continue;
        }
        if (neighbourCount[seat.pos.name()] >= 4) {
            g.set(seat.pos, "L");
            continue;
        }
        // or leave value as is
    }
};

const liveUntilStable = (g: Grid<string>) => {
    let hash = "";
    do {
        hash = g.hash();
        evolve(g);
        // console.log(g.toString());
    } while (hash !== g.hash());

};

const rig = new Rig(11, async (d) => {
    const grid = new Grid<string>();
    grid.parseFromString(d, { L: "L"});
    liveUntilStable(grid);

    return [...grid.positions("#")].length;
});
(async (): Promise<void> => {
    await rig.test(`L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL`, 37);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
