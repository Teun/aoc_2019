import { firstBy } from "thenby";
import { Coord, DirectionDiag, Grid } from "./modules/grid";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";

function *visibleFrom(pos: Coord, g: Grid<string>): IterableIterator<Coord> {
    const boundaries = g.boundaries();

    for (const dir of [
        DirectionDiag.North, DirectionDiag.NorthEast, DirectionDiag.East,
        DirectionDiag.SouthEast, DirectionDiag.South, DirectionDiag.SouthWest,
        DirectionDiag.West, DirectionDiag.NorthWest]) {
        let curr = pos;
        do {
            curr = curr.neighbourToDiag(dir);
            yield curr;
        }while (inside(boundaries, curr) && !g.forCoord(curr));
    }
}
const inside = (boundaries: Coord[], pos: Coord) => {
    if (pos.x < boundaries[0].x) { return false; }
    if (pos.x > boundaries[1].x) { return false; }
    if (pos.y < boundaries[0].y) { return false; }
    if (pos.y > boundaries[1].y) { return false; }
    return true;
};
const evolve = (g: Grid<string>) => {
    const neighbourCount: {[key: string]: number} = {};
    for (const seat of g.positions("#")) {
        [...visibleFrom(seat.pos, g)].forEach((p) => {
            neighbourCount[p.name()] = (neighbourCount[p.name()] || 0) + 1;
        });
    }
    for (const seat of g.positionsFunc((s) => s === "#" || s === "L")) {
        if (!neighbourCount[seat.pos.name()]) {
            g.set(seat.pos, "#");
            continue;
        }
        if (neighbourCount[seat.pos.name()] >= 5) {
            g.set(seat.pos, "L");
            continue;
        }
        // or leave value as is
    }
};

const liveUntilStable = (g: Grid<string>) => {
    let count = 0;
    do {
        count = [...g.positions("#")].length;
        evolve(g);
        console.log(count);
    } while (count !== [...g.positions("#")].length);

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
L.LLLLL.LL`, 26);
    await rig.runPrint();
})()
.then(() => {console.log("Done"); });
