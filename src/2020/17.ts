import { Grid3d } from "./modules/grid3d";
import { Rig } from "./modules/rig";

const evolve = (g: Grid3d<string>) => {
    const count = new Grid3d<number>();
    for (const living of g.positions("#")) {
        for (const neighbour of living.pos.neigboursDiag()) {
            count.setIfEmpty(neighbour, 0);
            count.set(neighbour, count.forCoord(neighbour) + 1);
        }
    }
    const next = new Grid3d<string>();
    for (const counted of count.positions()) {
        if (g.forCoord(counted.pos) === "#" && (counted.val === 2 || counted.val === 3)) {
            next.set(counted.pos, "#");
        }
        if (g.forCoord(counted.pos) !== "#" && (counted.val === 3)) {
            next.set(counted.pos, "#");
        }
    }
    return next;
};

const iterations = (g: Grid3d<string>, cycles: number) => {
    for (let i = 0; i < cycles; i++) {
        g = evolve(g);
    }
    return g;
};

const rig = new Rig(17, async (d) => {
    const grid = new Grid3d<string>();
    grid.parseFromString(d, 0, { "#": "#"});

    const result = iterations(grid, 6);

    return [...result.positions("#")].length;
});
(async (): Promise<void> => {
    await rig.testFromFile("1", 112);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
