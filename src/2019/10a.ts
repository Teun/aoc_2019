import { bigCombination } from "js-combinatorics";
import { firstBy as by } from "thenby";
import {Coord, Grid} from "./modules/grid";
import { parseToObjects } from "./modules/lineParser";
import { Rig } from "./modules/rig";
import { generateKeyPairSync } from "crypto";

const canSee = (first: Coord, second: Coord, all: Set<string>) => {
    if (first.name() === second.name()) { return false; }
    const lowestXCoord = first.x < second.x ? first : second;
    const highestXCoord = first.x < second.x ? second : first;
    const lowestYCoord = first.y < second.y ? first : second;
    const highestYCoord = first.y < second.y ? second : first;
    for (let step =  1; step < highestXCoord.x - lowestXCoord.x; step++) {
        const vx = lowestXCoord.x + step;
        const vy = lowestXCoord.y +
            (highestXCoord.y - lowestXCoord.y) *
            (step / (highestXCoord.x - lowestXCoord.x));
        if (all.has(`${vx}x${vy}`)) {
            return false;
        }
    }
    for (let step =  1; step < highestYCoord.y - lowestYCoord.y; step++) {
        const vy = lowestYCoord.y + step;
        const vx = lowestYCoord.x +
            (highestYCoord.x - lowestYCoord.x) *
            (step / (highestYCoord.y - lowestYCoord.y));
        if (all.has(`${vx}x${vy}`)) {
            return false;
        }
        }
    return true;
};

const findAllScores = (all: Coord[]) => {
    const allCombinations = bigCombination(all, 2).toArray();
    const allVisible = allCombinations.filter((cb) => canSee(cb[0], cb[1], new Set(all.map((c) => c.name()))));
    return all.map((p) => {
        return {
            pos: p.name(),
            score: allVisible.filter((combi) => combi[0].name() === p.name() || combi[1].name() === p.name()).length
        };
    });
};
const clearUntil = (grid: Grid<string>, from: Coord, until: number) => {
    const all = [...grid.positions()];
    const set = new Set(all.map((p) => p.pos.name()));
    const allVisible =  all.filter((p) => canSee(from, p.pos, set));
    if (allVisible.length < until) {
        allVisible.forEach((gp) => grid.clear(gp.pos));
        return clearUntil(grid, from, until - allVisible.length);
    }
    const sorted = allVisible.sort(
        by((c) => c.pos.x >= from.x ? -1 : 1)
         .thenBy((c) => Math.atan((c.pos.y - from.y) / (c.pos.x - from.x)))
        );
    return sorted[until - 1].pos;
};
const rig = new Rig(10,
    async (d, o, ro: Coord) => {
        const grid = new Grid<string>();
        grid.parseFromString(d, {"#": "#"});
        const laserPos = ro;
        const pos = clearUntil(grid, laserPos, 200);
        return pos.x * 100 + pos.y;
    }
);
(async () => {
    await rig.testFromFile("large", 802, new Coord(11, 13));
    await rig.runPrint(new Coord(17, 23));
})().then(() => {console.log("Done"); });
