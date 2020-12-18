import { Grid4d } from "./modules/grid4d";
import { Rig } from "./modules/rig";

const evolve = (g: Grid4d<string>) => {
    const count = new Grid4d<number>();
    for (const living of g.positions("#")) {
        for (const neighbour of living.pos.neigboursDiag()) {
            count.setIfEmpty(neighbour, 0);
            count.set(neighbour, count.forCoord(neighbour) + 1);
        }
    }
    const next = new Grid4d<string>();
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

const iterations = (g: Grid4d<string>, cycles: number) => {
    for (let i = 0; i < cycles; i++) {
        g = evolve(g);
    }
    return g;
};

const rig = new Rig(17, async (d) => {
    const grid = new Grid4d<string>();
    grid.parseFromString(d, 0, 0, { "#": "#"});

    const result = iterations(grid, 6);

    return [...result.positions("#")].length;
});
(async (): Promise<void> => {
    await rig.testFromFile("1", 848);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
